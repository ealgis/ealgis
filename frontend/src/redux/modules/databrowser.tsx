import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { fetchTables, fetchColumnsForTableName, fetchColumnsByKindAndType, fetchColumnsForGeometryAndKindAndType } from "./datasearch"
import { editDraftLayer } from "../../redux/modules/maps"
import { addColumnToLayerSelection } from "./maps"
import { ITable, ILayer, IColumn, ISelectedColumn, eTableSearchMode } from "./interfaces"

// Actions
const SELECT_TABLES = "ealgis/databrowser/SELECT_TABLES"
const SELECT_COLUMNS = "ealgis/databrowser/SELECT_COLUMNS"
const SELECT_COLUMN = "ealgidatabrowser/SELECT_COLUMN"

const initialState: IModule = { selectedTables: [], selectedColumns: [] }

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case SELECT_TABLES:
            return dotProp.set(state, "selectedTables", action.selectedTables)
        case SELECT_COLUMNS:
            return dotProp.set(state, "selectedColumns", action.selectedColumns)
        case SELECT_COLUMN:
            return dotProp.set(state, "selectedColumn", action.selectedColumn)
        default:
            return state
    }
}

// Action Creators
export function selectTables(selectedTables: Array<string>): IAction {
    return {
        type: SELECT_TABLES,
        selectedTables,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}
export function selectColumns(selectedColumns: Array<IColumn>): IAction {
    return {
        type: SELECT_COLUMNS,
        selectedColumns,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}
export function unselectColumns(selectedColumns: Array<any>): IAction {
    return {
        type: SELECT_COLUMNS,
        selectedColumns,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}
export function selectColumn(selectedColumn: IColumn): IAction {
    return {
        type: SELECT_COLUMN,
        selectedColumn,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}

// Models
export interface IModule {
    selectedTables: Array<string>
    selectedColumns: Array<IColumn>
    selectedColumn: IColumn
}

export interface IAction {
    type: string
    selectedTables?: Array<string>
    selectedColumns?: Array<IColumn>
    selectedColumn?: IColumn
    meta?: {
        analytics: IAnalyticsMeta
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function searchTables(chips: Array<string>, chipsExcluded: Array<string>, schema_name: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const tables = await dispatch(fetchTables(chips, chipsExcluded, schema_name, eTableSearchMode.BY_TABLE))
        dispatch(selectTables(Object.keys(tables)))
    }
}

export function searchTablesByKindAndType(chips: Array<string>, chipsExcluded: Array<string>, schema_name: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const tables = await dispatch(fetchTables(chips, chipsExcluded, schema_name, eTableSearchMode.BY_KIND_AND_TYPE))
        // dispatch(selectTables(tables))
        dispatch(selectTables(Object.keys(tables)))
    }
}

export function searchColumns(schema_name: string, tableinfo_name: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const columns = await dispatch(fetchColumnsForTableName(schema_name, tableinfo_name))
        dispatch(selectColumns(columns["columns"]))
    }
}

export function searchColumnsByKindAndType(table: any, tablePopulationName: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const columns = await dispatch(fetchColumnsByKindAndType(table, tablePopulationName))
        dispatch(selectColumns(columns["columns"]))
    }
}

export function fetchSingleColumnByKindAndType(
    mapId: number,
    layerId: number,
    layer: ILayer,
    geometry: any,
    kind: string,
    type: string,
    table: ITable
) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const columns = await dispatch(fetchColumnsForGeometryAndKindAndType(geometry, kind, type, table))

        if (columns["columns"].length === 1) {
            const columnPartial: ISelectedColumn = { id: columns["columns"][0]["id"], schema: geometry["schema_name"] }
            dispatch(addColumnToLayerSelection(mapId, layerId, columnPartial))
            dispatch(editDraftLayer(mapId, layerId, { selectedColumns: [...layer.selectedColumns, columnPartial] }))
        } else {
            dispatch(sendSnackbarNotification(`Oops! We found too many or too few columns (${columns["columns"].length})!`))
        }
    }
}

export function emptySelectedColumns() {
    return (dispatch: Function) => {
        dispatch(unselectColumns([]))
    }
}
