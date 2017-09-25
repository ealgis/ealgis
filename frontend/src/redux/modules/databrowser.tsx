import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { loadTables, loadColumns } from "../../redux/modules/ealgis"
import { editDraftLayer } from "../../redux/modules/maps"
import { addColumnToLayerSelection } from "./maps"
import { IGeomTable, ITable, ILayer, IColumn, ISelectedColumn } from "./interfaces"

// Actions
const SELECT_TABLES = "ealgis/databrowser/SELECT_TABLES"
const SELECT_COLUMNS = "ealgis/databrowser/SELECT_COLUMNS"
const SELECT_COLUMN = "ealgidatabrowser/SELECT_COLUMN"

const initialState: IModule = { selectedTables: [], selectedColumns: [], selectedColumn: null }

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
export function selectColumns(selectedColumns: Array<string>): IAction {
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
    selectedColumns: Array<string>
    selectedColumn: IColumn
}

export interface IAction {
    type: string
    selectedTables?: Array<string>
    selectedColumns?: Array<string>
    selectedColumn?: IColumn
    meta?: {
        analytics: IAnalyticsMeta
    }
}

export interface ITablesBySchemaAndFamily {
    [key: string]: ITableFamily
}

export interface ITableFamily {
    family: string
    type: string
    tables: Array<ITable>
}

export interface ITableColumns {
    // columnUID = schema_name.column_id
    [key: string]: IColumn
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function searchTables(chips: Array<string>, chipsExcluded: Array<string>, schema_name: string, geometry: IGeomTable) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/tableinfo/search/", dispatch, {
            search: chips.join(","),
            search_excluded: chipsExcluded.join(","),
            schema: schema_name,
            geo_source_id: geometry._id,
        })

        if (response.status === 404) {
            dispatch(sendSnackbarNotification("No tables found matching your search criteria."))
        } else if (response.status === 200) {
            dispatch(loadTables(json))
            dispatch(selectTables(Object.keys(json)))
        }
    }
}

export function searchColumns(schema_name: string, tableinfo_name: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/columninfo/search/", dispatch, {
            schema: schema_name,
            tableinfo_name: tableinfo_name,
        })

        dispatch(loadColumns(json["columns"]))
        dispatch(selectColumns(Object.keys(json["columns"])))
    }
}

export function emptySelectedTables() {
    return (dispatch: Function) => {
        dispatch(selectTables([]))
    }
}
export function emptySelectedColumns() {
    return (dispatch: Function) => {
        dispatch(selectColumns([]))
    }
}
