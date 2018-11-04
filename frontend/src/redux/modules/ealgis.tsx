import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient } from "../../shared/api/EALGISApiClient"
import { ColourScale, DiscreteColourScale, HLSDiscreteColourScale, RGB } from "../../shared/openlayers/colour_scale"
import { loaded as appLoaded, loading as appLoading } from "./app"
import { parseColumnsFromExpression } from "./databrowser"
import { fetchMaps } from "./maps"

// Actions
const LOAD_USER = "ealgis/ealgis/LOAD_USER"
const LOAD_RECENT_TABLES = "ealgis/ealgis/LOAD_RECENT_TABLES"
const LOAD_FAVOURITE_TABLES = "ealgis/ealgis/LOAD_FAVOURITE_TABLES"
const LOAD_GEOM = "ealgis/ealgis/LOAD_GEOM"
const LOAD_COLOUR_DEFS = "ealgis/ealgis/LOAD_COLOUR_DEFS"
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
    colourdefs: {},
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
        case LOAD_COLOUR_DEFS:
            return dotProp.set(state, "colourdefs", action.colourdefs)
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

export function loadColourDefs(colourdefs: IColourDefs) {
    return {
        type: LOAD_COLOUR_DEFS,
        colourdefs,
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
    colourdefs: IColourDefs
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
    colourdefs: IColourDefs
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
    geometry_source_schema_name: string
    geometry_source_id: number
}

export interface TableMetadataJSON {
    kind: string
    type: string
    series: string
    family: string
    notes: string
    metadataUrls: Array<TableMetadataURL>
    topics: Array<string>
}

export interface TableMetadataURL {
    name: string
    url: string
}

export interface ITableInfo {
    [key: string]: ITable
}

export interface IColourDefs {
    [key: string]: ColourScale
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
    schema_title: string
}

export interface ISchema {
    name: string
    family: string
    uuid: string
    description: string
    date_created: number
    date_published: number
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
    geometry_source_schema_name: string
    geometry_source_id: number
}

export interface ColumnMetadataJSON {
    kind: string
    type: string
    table_name: string
    category: string
    category_value: string
    bucket: string
    is_total?: boolean
    na?: boolean // Not applicable i.e. This data point has no value for this row/column combination
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
                dispatch(fetchColourDefs()),
                dispatch(fetchSchemaInfo()),
                dispatch(fetchTablesIfUncached([...self.user.favourite_tables, ...self.user.recent_tables])),
            ])
            await dispatch(fetchColumnsForMaps())
        } else if (self.is_logged_in === false && getState()["app"]["private_site"] === false) {
            await Promise.all([dispatch(fetchMaps()), dispatch(fetchGeomInfo()), dispatch(fetchColourDefs())])
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
        window.location.href = "/"
    }
}

export function addToRecentTables(schema_name: string, table_id: number) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const recentTables = getState()["ealgis"]["user"]["recent_tables"]
        if (recentTables.find((table: Partial<ITable>) => table.schema_name === schema_name && table.id === table_id) === undefined) {
            return ealapi
                .put("/api/0.1/profile/recent_tables/", { table: { id: table_id, schema_name: schema_name } }, dispatch)
                .then(({ response, json }: any) => {
                    if (response.status === 200) {
                        dispatch(loadRecentTables(json["recent_tables"]))
                    } else {
                        // We're not sure what happened, but handle it:
                        // our Error will get passed straight to `.catch()`
                        throw new Error(
                            "Unhandled error adding recent tables. Please report. (" + response.status + ") " + JSON.stringify(json)
                        )
                    }
                })
        }
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
                let columns: Array<any> = []

                if (layer.fill.expression_mode !== undefined) {
                    columns = parseColumnsFromExpression(layer.fill.expression, layer.fill.expression_mode)
                }

                if (layer.fill.conditional_mode !== undefined) {
                    columns = [...columns, ...parseColumnsFromExpression(layer.fill.conditional, layer.fill.conditional_mode)]
                }

                columns.forEach((column: string) => {
                    const [schema_name, column_name] = column.split(".")

                    if (!(schema_name in columnNamesBySchema)) {
                        columnNamesBySchema[schema_name] = []
                    }

                    if (columnNamesBySchema[schema_name].includes(column_name) === false) {
                        columnNamesBySchema[schema_name].push(column_name)
                    }
                })
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
        dispatch(loadGeom(json))
    }
}
export function fetchColourDefs() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/colours/", dispatch)

        let colourdefs: IColourDefs = {}
        let colourinfo: IColourInfo = {}
        const register = (name: string, defn: ColourScale) => {
            // Register definition
            colourdefs[`${name}.${defn.get_nlevels()}`] = defn

            // Register colour info
            if (!(name in colourinfo)) {
                colourinfo[name] = []
            }
            colourinfo[name].push(defn.get_nlevels())
        }

        // Register Huey colour definitions
        for (var i = 2; i <= 12; i++) {
            register("Huey", new HLSDiscreteColourScale(0.5, 0.8, i))
        }

        // object {column name: index}
        var headerToColIdxMapping: { [key: string]: number } = json["header"].reduce((obj: any, k: any, i: any) => ({ ...obj, [k]: i }), {})

        var getter = (row: any, col_name: string) => row[headerToColIdxMapping[col_name]]
        var rgb_getter = (row: any, col_name: string) => parseInt(row[headerToColIdxMapping[col_name]]) / 255

        let counter = 0
        for (let row of json["colours"]) {
            let colour_name = getter(row, "ColorName")
            let num_colours = parseInt(getter(row, "NumOfColors"))

            // Break out before we get to the license embedded in the CSV file
            if (colour_name === "" && getter(row, "ColorNum") === "") {
                break
            }

            // Skip any rows within a colour range
            if (colour_name === "") {
                counter += 1
                continue
            }

            let colours: Array<any> = []
            colours.push(new RGB(rgb_getter(row, "R"), rgb_getter(row, "G"), rgb_getter(row, "B")))

            for (var index = counter + 1; index < counter + num_colours; index++) {
                let r = json["colours"][index]
                colours.push(new RGB(rgb_getter(r, "R"), rgb_getter(r, "G"), rgb_getter(r, "B")))
            }

            register(colour_name, new DiscreteColourScale(colours))
            counter += 1
        }

        dispatch(loadColourDefs(colourdefs))
        dispatch(loadColours(colourinfo))
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
    const user = getState().ealgis["user"]
    return user !== null ? user.id : null
}

export function getGeomInfoFromState(getState: Function) {
    return getState().ealgis.geominfo
}
