import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { loadTables as loadTablesToAppCache, loadColumns as loadColumnsToAppCache } from "../../redux/modules/ealgis"
import { editDraftLayer } from "../../redux/modules/maps"
import { IStore, IGeomTable, ITable, ILayer, IColumn, ISelectedColumn, eEalUIComponent } from "./interfaces"

// Actions
const START = "ealgis/databrowser/START"
const FINISH = "ealgis/databrowser/FINISH"
const ADD_TABLES = "ealgis/databrowser/ADD_TABLES"
const ADD_COLUMNS = "ealgis/databrowser/ADD_COLUMNS"
const SELECT_COLUMN = "ealgidatabrowser/SELECT_COLUMN"

const initialState: Partial<IModule> = { active: false, tables: [], columns: [], selectedColumns: [] }

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case START:
            state = dotProp.set(state, "active", true)
            state = dotProp.set(state, "tables", [])
            state = dotProp.set(state, "columns", [])
            state = dotProp.set(state, "selectedColumns", [])
            state = dotProp.set(state, "component", action.component)
            return dotProp.set(state, "message", action.message)
        case FINISH:
            return dotProp.set(state, "active", false)
        case ADD_TABLES:
            return dotProp.set(state, "tables", action.tables)
        case ADD_COLUMNS:
            return dotProp.set(state, "columns", action.columns)
        case SELECT_COLUMN:
            return dotProp.set(state, "selectedColumns", [...state.selectedColumns!, action.column])
        default:
            return state
    }
}

// Action Creators
export function startBrowsing(component: eEalUIComponent, message: string): IAction {
    return {
        type: START,
        component,
        message,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}
export function finishBrowsing(): IAction {
    return {
        type: FINISH,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}
export function addTables(tables: Array<string>): IAction {
    return {
        type: ADD_TABLES,
        tables,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}
export function addColumns(columns: Array<string>): IAction {
    return {
        type: ADD_COLUMNS,
        columns,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}
export function selectColumn(column: IColumn): IAction {
    return {
        type: SELECT_COLUMN,
        column,
        meta: {
            analytics: {
                category: "DataBrowser",
            },
        },
    }
}

// Models
export interface IModule {
    active: boolean
    component: eEalUIComponent
    message: string
    tables: Array<string>
    columns: Array<string>
    selectedColumns: Array<IColumn>
}

export interface IAction {
    type: string
    component?: eEalUIComponent
    message?: string
    tables?: Array<string>
    columns?: Array<string>
    column?: IColumn
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

export interface IDataBrowserResult {
    valid: boolean
    message?: string
    columns?: Array<IColumn>
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
            dispatch(loadTablesToAppCache(json))
            dispatch(addTables(Object.keys(json)))
        }
    }
}

export function fetchColumns(schema_name: string, tableinfo_name: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/columninfo/fetch_for_table/", dispatch, {
            schema: schema_name,
            tableinfo_name: tableinfo_name,
        })

        dispatch(loadColumnsToAppCache(json["columns"]))
        dispatch(addColumns(Object.keys(json["columns"])))
    }
}

export function emptySelectedTables() {
    return (dispatch: Function) => {
        dispatch(addTables([]))
    }
}
export function emptySelectedColumns() {
    return (dispatch: Function) => {
        dispatch(addColumns([]))
    }
}

// @FIXME Lazy person's redux selectors
export function fetchResultForComponent(component: eEalUIComponent, state: IStore): IDataBrowserResult {
    const { databrowser } = state

    if (databrowser.active === false && databrowser.component === component && databrowser.selectedColumns.length > 0) {
        return {
            valid: true,
            message: databrowser.message,
            columns: databrowser.selectedColumns,
        }
    }
    return { valid: false }
}
