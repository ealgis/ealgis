import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { loadTables, ITableInfo, IGeomTable } from "../../redux/modules/ealgis"
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
    metadata_json: TableMetadataJSON
    schema_name: string
}

export interface TableMetadataJSON {
    kind: string
    type: string
}

export interface IColumn {
    id: number
    name: string
    tableinfo_id: number
    metadata_json: ColumnMetadataJSON
    geomlinkage: {
        id: number
        geo_source_id: number
        geo_column: string
        attr_table_info_id: number
        attr_column: string
    }
}

export interface ColumnMetadataJSON {
    kind: string
    type: string
    table_name: string
    category: string
    category_value: string
    bucket: string
    is_total?: boolean
}

interface ColumnInfoSearchResponse {
    columns: Array<IColumn>
    tables: ITableInfo
}

export enum eTableSearchMode {
    BY_TABLE = 1,
    BY_KIND_AND_TYPE = 2,
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchTables(
    chips: Array<string>,
    chipsExcluded: Array<string>,
    schema_name: string,
    mode: eTableSearchMode
) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        // dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/tableinfo/search/", dispatch, {
            search: chips.join(","),
            search_excluded: chipsExcluded.join(","),
            schema: schema_name,
            // geo_source_id: geometry["_id"],
            // geo_source_id: 4,
            geo_source_id: mode == eTableSearchMode.BY_KIND_AND_TYPE ? "" : 4,
            mode: mode == eTableSearchMode.BY_KIND_AND_TYPE ? "by_kind_and_type" : "by_table",
        })
        processTableInfoResponse(response, json, dispatch)
        if (response.status === 200) {
            return json
        }
    }
}

export function processTableInfoResponse(response: IHttpResponse, json: ITableInfo, dispatch: Function) {
    if (response.status === 404) {
        dispatch(sendSnackbarNotification("No tables found matching your search criteria."))
        return
    }

    dispatch(loadTables(json))

    // let columnsByTable: Map<string, ITableAndCols> = new Map()

    // for (let key in json["columns"]) {
    //     const col = json["columns"][key]
    //     const tableName = json[col["tableinfo_id"]].metadata_json["type"]

    //     if (columnsByTable.has(tableName) === false) {
    //         let tableInfo: ITableAndCols = {
    //             table: json[col["tableinfo_id"]],
    //             columns: [],
    //         }
    //         columnsByTable.set(tableName, tableInfo)
    //     }

    //     let tableInfo = columnsByTable.get(tableName)
    //     tableInfo!.columns.push(col)
    // }
    // dispatch(load(columnsByTable))
}

export function fetchColumnsForTableName(schema_name: string, tableinfo_name: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/columninfo/search/", dispatch, {
            schema: schema_name,
            tableinfo_name: tableinfo_name,
        })
        processColumnInfoResponse(response, json, dispatch)
        return json
    }
}

export function fetchColumnsForTable(chips: Array<string>, geometry: IGeomTable, table_names: Array<string>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/columninfo/search/", dispatch, {
            search: chips.join(","),
            schema: geometry["schema_name"],
            tableinfo_name: table_names.join(","),
        })
        processColumnInfoResponse(response, json, dispatch)
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
        processColumnInfoResponse(response, json, dispatch)
    }
}

export function fetchColumnsForGeometryAndKindAndType(geometry: IGeomTable, kind: string, type: string, table: ITable) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/columninfo/search/", dispatch, {
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
            kind: kind,
            type: type,
            profileTablePrefix: table["profile_table"],
        })
        // processColumnInfoResponse(response, json, dispatch)
        return json
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
        processColumnInfoResponse(response, json, dispatch)
    }
}

export function fetchColumnsByKindAndType(table: any, tablePopulationName: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(reset())

        const { response, json } = await ealapi.get("/api/0.1/columninfo/by_table_kind_and_type/", dispatch, {
            schema: table["schema_name"],
            kind: table["metadata_json"]["kind"],
            type: table["metadata_json"]["type"],
            tablePopulationName: tablePopulationName,
            profileTablePrefix: table["profile_table"],
        })
        // processColumnInfoResponse(response, json, dispatch)
        return json
    }
}

export function processColumnInfoResponse(response: IHttpResponse, json: ColumnInfoSearchResponse, dispatch: Function) {
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
        tableInfo!.columns.push(col)
    }
    dispatch(load(columnsByTable))
}
