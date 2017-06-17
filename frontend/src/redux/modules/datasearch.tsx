import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { loadTables, IGeomTable } from "../../redux/modules/ealgis"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"

// Actions
const LOAD = "ealgis/datasearch/LOAD"
const RESET = "ealgis/datasearch/RESET"

const initialState: IModule = {
    results: new Map(),
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case LOAD:
            return dotProp.set(state, "results", action.results)
        case RESET:
            return dotProp.set(state, "results", [])
        default:
            return state
    }
}

// Action Creators
export function load(results: Map<string, ITableAndCols>): IAction {
    return {
        type: LOAD,
        results,
        meta: {
            analytics: {
                category: "DataSearch",
            },
        },
    }
}

export function reset(): IAction {
    return {
        type: RESET,
    }
}

// Models
export interface IModule {
    results: Map<string, ITableAndCols>
}

export interface IAction {
    type: string
    meta?: {
        analytics: IAnalyticsMeta
    }
    results?: Map<string, ITableAndCols>
}

export interface ITableAndCols {
    table: ITable
    columns: Array<IColumn>
}

export interface ITable {
    id: number
    name: string
    metadata_json: MetadataJSON
    schema_name: string
}

export interface IColumn {
    id: number
    name: string
    tableinfo_id: number
    metadata_json: MetadataJSON
    geomlinkage: {
        id: number
        geo_source_id: number
        geo_column: string
        attr_table_info_id: number
        attr_column: string
    }
}

export interface MetadataJSON {
    kind: string
    type: string
}

interface ColumnInfoSearchResponse {
    columns: Array<IColumn>
    tables: {
        [key: string]: ITable
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchColumnsForTable(chips: Array<string>, geometry: IGeomTable, table_names: Array<string>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/columninfo/search/", dispatch, {
            search: chips.join(","),
            schema: geometry["schema_name"],
            tableinfo_name: table_names.join(","),
        })
        processResults(response, json, dispatch)
    }
}

export function fetchColumnsByName(chips: Array<string>, geometry: IGeomTable) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/columninfo/by_name/", dispatch, {
            name: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        })
        processResults(response, json, dispatch)
    }
}

export function fetchColumnsForGeometry(chips: Array<string>, geometry: IGeomTable) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/columninfo/search/", dispatch, {
            search: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        })
        processResults(response, json, dispatch)
    }
}

interface SearchFn {
    (subString: string): Promise<boolean>
}

export function getColumnsForTable(chips: Array<string>, geometry: IGeomTable, table_names: Array<string>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            search: chips.join(","),
            schema: geometry["schema_name"],
            tableinfo_name: table_names.join(","),
        }

        const { response, json } = await ealapi.get("/api/0.1/columninfo/search/", dispatch, params)
        return { response, json }
    }
}

export function getColumnsForGeometry(chips: Array<string>, geometry: IGeomTable) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            search: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        }
        return ealapi.get("/api/0.1/columninfo/search/", dispatch, params)
    }
}

export function getColumnsByName(chips: Array<string>, geometry: IGeomTable) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            name: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        }
        return ealapi.get("/api/0.1/columninfo/by_name/", dispatch, params)
    }
}

export function processResults(response: IHttpResponse, json: ColumnInfoSearchResponse, dispatch: Function) {
    if (response.status === 404) {
        dispatch(sendSnackbarNotification("No columns found matching your search criteria."))
        return
    }

    dispatch(loadTables(json["tables"]))

    let columnsByTable: Map<string, ITableAndCols> = new Map()

    for (let key in json["columns"]) {
        const col = json["columns"][key]
        const tableName = json["tables"][col["tableinfo_id"]].metadata_json["type"]

        if (columnsByTable.has(tableName) === false) {
            let tableInfo: ITableAndCols = {
                table: json["tables"][col["tableinfo_id"]],
                columns: [],
            }
            columnsByTable.set(tableName, tableInfo)
        }

        let tableInfo = columnsByTable.get(tableName)
        tableInfo.columns.push(col)
    }
    dispatch(load(columnsByTable))
}
