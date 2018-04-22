import * as dotProp from "dot-prop-immutable"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { loading as appLoading, loaded as appLoaded } from "./app"
import { parseValueExpression, parseFilterExpression } from "./databrowser"
import { ILayer, eLayerValueExpressionMode, eLayerFilterExpressionMode } from "./interfaces"
import { fetchMaps } from "./maps"

// Actions
const LOAD_USER = "ealgis/ealgis/LOAD_USER"
const LOAD_RECENT_TABLES = "ealgis/ealgis/LOAD_RECENT_TABLES"
const LOAD_FAVOURITE_TABLES = "ealgis/ealgis/LOAD_FAVOURITE_TABLES"
const LOAD_GEOM = "ealgis/ealgis/LOAD_GEOM"
const LOAD_COLOURS = "ealgis/ealgis/LOAD_COLOURS"
const LOAD_TABLES = "ealgis/ealgis/LOAD_TABLES"
const LOAD_TABLE = "ealgis/ealgis/LOAD_TABLE"
const LOAD_SCHEMAS = "ealgis/ealgis/LOAD_SCHEMAS"
const LOAD_COLUMNS = "ealgis/ealgis/LOAD_COLUMNS"
const LOAD_COLUMN = "ealgis/ealgis/LOAD_COLUMN"

const initialState: IModule = {
    user: {} as IUser,
    geominfo: {},
    tableinfo: {},
    colourinfo: {},
    schemainfo: {},
    columninfo: {},
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_USER:
            return dotProp.set(state, "user", action.user)
        case LOAD_RECENT_TABLES:
            return dotProp.set(state, "user.recent_tables", action.recent_tables)
        case LOAD_FAVOURITE_TABLES:
            return dotProp.set(state, "user.favourite_tables", action.favourite_tables)
        case LOAD_GEOM:
            return dotProp.set(state, "geominfo", action.geominfo)
        case LOAD_COLOURS:
            return dotProp.set(state, "colourinfo", action.colourinfo)
        case LOAD_TABLES:
            return dotProp.set(state, "tableinfo", { ...state.tableinfo, ...action.tableinfo })
        case LOAD_TABLE:
            return dotProp.set(state, `tableinfo.${action.schema}.${action.table.id}.`, action.table)
        case LOAD_SCHEMAS:
            return dotProp.set(state, "schemainfo", action.schemainfo)
        case LOAD_COLUMNS:
            return dotProp.set(state, "columninfo", { ...state.columninfo, ...action.columninfo })
        case LOAD_COLUMN:
            return dotProp.set(state, `columninfo.${action.schema}.${action.column.id}`, action.column)
        default:
            return state
    }
}

// Action Creators
export function loadUser(self: ISelf) {
    return {
        type: LOAD_USER,
        user: self.user,
    }
}

export function loadRecentTables(tables: Array<Partial<ITable>>) {
    return {
        type: LOAD_RECENT_TABLES,
        recent_tables: tables,
    }
}

export function loadFavouriteTables(tables: Array<Partial<ITable>>) {
    return {
        type: LOAD_FAVOURITE_TABLES,
        favourite_tables: tables,
    }
}

export function loadGeom(geominfo: IGeomInfo) {
    return {
        type: LOAD_GEOM,
        geominfo,
    }
}

export function loadColours(colourinfo: IColourInfo) {
    return {
        type: LOAD_COLOURS,
        colourinfo,
    }
}

export function loadTables(tableinfo: ITableInfo) {
    return {
        type: LOAD_TABLES,
        tableinfo,
    }
}

export function loadTable(table: ITable, schema: string) {
    return {
        type: LOAD_TABLE,
        table,
        schema,
    }
}

export function loadSchemas(schemainfo: ISchemaInfo) {
    return {
        type: LOAD_SCHEMAS,
        schemainfo,
    }
}

export function loadColumns(columninfo: IColumnInfo) {
    return {
        type: LOAD_COLUMNS,
        columninfo,
    }
}

export function loadColumn(column: IColumn, schema: string) {
    return {
        type: LOAD_COLUMN,
        column,
        schema,
    }
}

// Models
export interface IModule {
    user: IUser
    geominfo: IGeomInfo
    colourinfo: IColourInfo
    tableinfo: ITableInfo
    schemainfo: ISchemaInfo
    columninfo: IColumnInfo
}

export interface IAction {
    type: string
    user: IUser
    geominfo: IGeomInfo
    tableinfo: ITableInfo
    table: ITable
    colourinfo: IColourInfo
    schemainfo: ISchemaInfo
    columninfo: IColumnInfo
    column: IColumn
    schema: string
    recent_tables: Array<Partial<ITable>>
    favourite_tables: Array<Partial<ITable>>
}

export interface ISelf {
    is_logged_in: boolean
    user: IUser
}

export interface IUser {
    id: number
    url: string
    username: string
    first_name: string
    last_name: string
    email: string
    is_staff: boolean
    is_active: boolean
    date_joined: string
    groups: Array<string>
    is_approved: boolean
    recent_tables: Array<Partial<ITable>>
    favourite_tables: Array<Partial<ITable>>
}

export interface IUserPartial {
    id: number
    username: string
    first_name: string
    last_name: string
}

export interface IGeomInfo {
    [key: string]: IGeomTable
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
    series: string
    family: string
    notes: string
    metadataUrls: Array<TableMetadataURL>
}

export interface TableMetadataURL {
    name: string
    url: string
}

export interface ITableInfo {
    [key: string]: ITable
}

export interface IColourInfo {
    [key: string]: Array<number>
}

export interface IGeomTable {
    _id: number
    description: string
    geometry_type: string
    name: string
    schema_name: string
}

export interface ISchema {
    name: string
    family: string
    uuid: string
    description: string
    date_created: number
    schema_name: string
}

export interface ISchemaInfo {
    [key: string]: ISchema
}

export interface IColumnInfoResponse {
    column: IColumn
    table: ITable
    schema: string
}

export interface IColumnInfoBySchemaResponse {
    column: IColumnInfo
    table: ITableInfo
}

export interface IColumn {
    id: number
    name: string
    table_info_id: number
    metadata_json: ColumnMetadataJSON
    schema_name: string
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

export interface IColumnInfo {
    [key: string]: IColumn
}

export interface ISelectedColumn {
    id: number
    schema: string
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchUserMapsColumnsDataColourAndSchemaInfo() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(appLoading())

        const self: ISelf = await dispatch(fetchUser())
        if (self.is_logged_in && self.user.is_approved) {
            await Promise.all([
                dispatch(fetchMaps()),
                dispatch(fetchGeomInfo()),
                dispatch(fetchColourInfo()),
                dispatch(fetchSchemaInfo()),
                dispatch(fetchTablesIfUncached([...self.user.favourite_tables, ...self.user.recent_tables])),
            ])
            await dispatch(fetchColumnsForMaps())
        }

        dispatch(appLoaded())
    }
}

export function fetchUser() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/self", dispatch)
        dispatch(loadUser(json))
        return json
    }
}

export function logoutUser() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        await ealapi.get("/api/0.1/logout", dispatch)
        window.location.reload()
    }
}

export function addToRecentTables(tables: Array<Partial<ITable>>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        return ealapi.put("/api/0.1/profile/recent_tables/", { tables: tables }, dispatch).then(({ response, json }: any) => {
            if (response.status === 200) {
                dispatch(loadRecentTables(json["recent_tables"]))
            } else {
                // We're not sure what happened, but handle it:
                // our Error will get passed straight to `.catch()`
                throw new Error("Unhandled error adding recent tables. Please report. (" + response.status + ") " + JSON.stringify(json))
            }
        })
    }
}

export function toggleFavouriteTables(tables: Array<Partial<ITable>>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        return ealapi.put("/api/0.1/profile/favourite_tables/", { tables: tables }, dispatch).then(({ response, json }: any) => {
            if (response.status === 200) {
                dispatch(loadFavouriteTables(json["favourite_tables"]))
                if (json["removed"].length === 0) {
                    dispatch(sendSnackbarNotification("Table added to favourites"))
                } else {
                    dispatch(sendSnackbarNotification("Table removed from favourites"))
                }
            } else {
                // We're not sure what happened, but handle it:
                // our Error will get passed straight to `.catch()`
                throw new Error(
                    "Unhandled error adding table to favourites. Please report. (" + response.status + ") " + JSON.stringify(json)
                )
            }
        })
    }
}

export function fetchTablesIfUncached(tables: Array<Partial<ITable>>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const missingTables: Array<Partial<ITable>> = []
        const tableinfo: ITableInfo = getState()["ealgis"]["tableinfo"]
        const tableinfoUIDs: Array<string> = Object.keys(tables)
        for (var key in tables) {
            const table = tables[key]
            const tableUID: string = `${table.schema_name}.${table.id}`
            if (!(tableUID in tableinfo)) {
                missingTables.push(table)
            }
        }

        if (missingTables.length > 0) {
            const { response, json } = await ealapi.post("/api/0.1/tableinfo/fetch/", missingTables, dispatch)
            dispatch(loadTables(json["tables"]))
        }
    }
}

export function fetchColumnsForMaps() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        let columnNamesBySchema: any = {}

        const maps = getState()["maps"]
        for (let mapId in maps) {
            for (let layer of maps[mapId]["json"]["layers"]) {
                if (
                    layer.fill.expression_mode === eLayerValueExpressionMode.SINGLE ||
                    layer.fill.expression_mode === eLayerValueExpressionMode.PROPORTIONAL
                ) {
                    const parsed: any = parseValueExpression(layer.fill.expression, layer.fill.expression_mode)

                    if ("col1" in parsed) {
                        const [schema_name, column_name] = parsed.col1.split(".")
                        if (!(schema_name in columnNamesBySchema)) {
                            columnNamesBySchema[schema_name] = []
                        }

                        if (columnNamesBySchema[schema_name].includes(column_name) === false) {
                            columnNamesBySchema[schema_name].push(column_name)
                        }
                    }

                    if ("col2" in parsed) {
                        const [schema_name, column_name] = parsed.col2.split(".")
                        if (!(schema_name in columnNamesBySchema)) {
                            columnNamesBySchema[schema_name] = []
                        }

                        if (columnNamesBySchema[schema_name].includes(column_name) === false) {
                            columnNamesBySchema[schema_name].push(column_name)
                        }
                    }
                }

                if (layer.fill.conditional_mode !== undefined && layer.fill.conditional_mode !== eLayerFilterExpressionMode.SIMPLE) {
                    const parsed: any = parseFilterExpression(layer.fill.conditional, layer.fill.conditional_mode)

                    if ("col1" in parsed) {
                        const [schema_name, column_name] = parsed.col1.split(".")
                        if (!(schema_name in columnNamesBySchema)) {
                            columnNamesBySchema[schema_name] = []
                        }

                        if (columnNamesBySchema[schema_name].includes(column_name) === false) {
                            columnNamesBySchema[schema_name].push(column_name)
                        }
                    }

                    if ("col2" in parsed) {
                        const [schema_name, column_name] = parsed.col2.split(".")
                        if (!(schema_name in columnNamesBySchema)) {
                            columnNamesBySchema[schema_name] = []
                        }

                        if (columnNamesBySchema[schema_name].includes(column_name) === false) {
                            columnNamesBySchema[schema_name].push(column_name)
                        }
                    }
                }
            }
        }

        const { response, json } = await ealapi.post("/api/0.1/columninfo/by_schema/", columnNamesBySchema, dispatch)

        dispatch(loadColumns(json["columns"]))
        dispatch(loadTables(json["tables"]))
    }
}

export function fetchGeomInfo() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/datainfo/", dispatch)

        const ordered: IGeomInfo = {}
        Object.keys(json)
            .sort()
            .forEach(function(key: string) {
                ordered[key] = json[key]
            })
        dispatch(loadGeom(ordered))
    }
}

export function fetchColourInfo() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/colours/", dispatch)
        dispatch(loadColours(json))
    }
}

export function fetchSchemaInfo() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/schemas/", dispatch)
        dispatch(loadSchemas(json))
    }
}

export function fetchColumnInfo(column: ISelectedColumn) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get(`/api/0.1/columninfo/${column.id}/?schema=${column.schema}`, dispatch)
        dispatch(loadColumn(json["column"], json["schema"]))
        dispatch(loadTable(json["table"], json["schema"]))
    }
}

// Helper methods
export function getUserIdFromState(getState: Function) {
    return getState().ealgis["user"].id
}

export function getGeomInfoFromState(getState: Function) {
    return getState().ealgis.geominfo
}
