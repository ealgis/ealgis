import { entries as objectEntries, values as objectValues } from "core-js/library/fn/object"
import * as dotProp from "dot-prop-immutable"
import { xorBy } from "lodash-es"
import { parse } from "mathjs"
import {
    IGeomInfo,
    loadColumns as loadColumnsToAppCache,
    loadTable as loadTableToAppCache,
    loadTables as loadTablesToAppCache,
} from "../../redux/modules/ealgis"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IEALGISApiClient } from "../../shared/api/EALGISApiClient"
import {
    eEalUIComponent,
    eLayerFilterExpressionMode,
    eLayerValueExpressionMode,
    IColumn,
    IColumnInfo,
    IGeomTable,
    IMap,
    IStore,
    ITable,
    ITableInfo,
} from "./interfaces"

// Actions
const START = "ealgis/databrowser/START"
const FINISH = "ealgis/databrowser/FINISH"
const ADD_TABLES = "ealgis/databrowser/ADD_TABLES"
const ADD_COLUMNS = "ealgis/databrowser/ADD_COLUMNS"
const SELECT_COLUMN = "ealgidatabrowser/SELECT_COLUMN"
const DESELECT_COLUMN = "ealgidatabrowser/DESELECT_COLUMN"

const initialState: Partial<IModule> = {
    active: false,
    config: { showColumnNames: false, closeOnFinish: true },
    tables: [],
    columns: [],
    selectedColumns: [],
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case START:
            state = dotProp.set(state, "active", true)
            state = dotProp.set(state, "tables", [])
            state = dotProp.set(state, "columns", [])
            state = dotProp.set(state, "selectedColumns", action.selectedColumns)
            state = dotProp.set(state, "component", action.component)
            state = dotProp.set(state, "config", { ...state.config, ...action.config })
            return dotProp.set(state, "message", action.message)
        case FINISH:
            return dotProp.set(state, "active", false)
        case ADD_TABLES:
            return dotProp.set(state, "tables", action.tables)
        case ADD_COLUMNS:
            return dotProp.set(state, "columns", action.columns)
        case SELECT_COLUMN:
            const columns: Array<IColumn> = xorBy(
                state.selectedColumns,
                [action.column],
                // @ts-ignore
                (column: IColumn) => `${column.schema_name}.${column.id}`
            )
            return dotProp.set(state, "selectedColumns", columns)
        case DESELECT_COLUMN:
            return dotProp.set(state, "selectedColumns", removeColumnFromList(state.selectedColumns!, action.column!))
        default:
            return state
    }
}

// Action Creators
export function startBrowsing(
    component: eEalUIComponent,
    message: string,
    config: Partial<IDataBrowserConfig> = {},
    selectedColumns: Array<IColumn> = []
): IAction {
    return {
        type: START,
        component,
        message,
        config,
        selectedColumns,
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
export function addTables(tables: Array<Partial<ITable>>): IAction {
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
export function deselectColumn(column: IColumn): IAction {
    return {
        type: DESELECT_COLUMN,
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
    config: IDataBrowserConfig
    tables: Array<Partial<ITable>>
    columns: Array<string>
    selectedColumns: Array<IColumn>
}

export interface IAction {
    type: string
    component?: eEalUIComponent
    message?: string
    config?: Partial<IDataBrowserConfig>
    tables?: Array<Partial<ITable>>
    columns?: Array<string>
    selectedColumns?: Array<IColumn>
    column?: IColumn
    meta?: {
        analytics: IAnalyticsMeta
    }
}

export interface IDataBrowserConfig {
    showColumnNames: boolean
    closeOnFinish: boolean
}

export interface ISelectedSchemas {
    schemas: Array<string> // e.g. [General Community Profile]
    families: Array<string> // e.g. [ABS Census 2016]
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
export enum eTableChooserLayout {
    LIST_LAYOUT = 1,
    GRID_LAYOUT = 2,
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchTablesForSchema(schema_name: string, geometry: IGeomTable) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/tableinfo/", dispatch, {
            schema: schema_name,
            geo_source_id: geometry._id,
        })
        if (response.status === 404) {
            dispatch(sendSnackbarNotification(`This schema contains no data for the '${geometry.description}' level of detail.`))
        } else if (response.status === 200) {
            dispatch(loadTablesToAppCache(json))

            const tablePartials: Array<Partial<ITable>> = Object.keys(json).map((tableUID: string) => {
                return { id: json[tableUID]["id"], schema_name: json[tableUID]["schema_name"] }
            })
            dispatch(addTables(tablePartials))
        }
    }
}

export function searchTables(
    searchStrings: Array<string>,
    searchStringsExcluded: Array<string>,
    geometry: IGeomTable,
    selectedSchemas?: ISelectedSchemas
) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        let params: any = {
            search: searchStrings.join(","),
            search_excluded: searchStringsExcluded.join(","),
            geo_source_id: geometry._id,
        }
        if (selectedSchemas !== undefined) {
            if (selectedSchemas.families.length > 0) {
                params["schema_families"] = JSON.stringify(selectedSchemas.families)
            }
            if (selectedSchemas.schemas.length > 0) {
                params["schemas"] = JSON.stringify(selectedSchemas.schemas)
            }
        }

        const { response, json } = await ealapi.get("/api/0.1/tableinfo/search/", dispatch, params)

        if (response.status === 404) {
            dispatch(sendSnackbarNotification("No tables found matching your search criteria."))
        } else if (response.status === 200) {
            dispatch(loadTablesToAppCache(json))

            const tablePartials: Array<Partial<ITable>> = Object.keys(json).map((tableUID: string) => {
                return { id: json[tableUID]["id"], schema_name: json[tableUID]["schema_name"] }
            })
            dispatch(addTables(tablePartials))
        }
    }
}

export function fetchTableByFamilyAndGeometry(table: ITable, geometry: IGeomTable) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        if (table.geometry_source_id !== geometry._id) {
            const { response, json } = await ealapi.get("/api/0.1/tableinfo/fetch_table_for_geometry/", dispatch, {
                schema: table.schema_name,
                table_family: table.metadata_json.family,
                geo_source_id: geometry._id,
            })

            if (response.status === 404) {
                dispatch(sendSnackbarNotification(`There is no equivalent table for the '${geometry.description}' level of detail.`))
                return null
            } else if (response.status === 200) {
                dispatch(loadTableToAppCache(json.table, json.table.schema_name))
                return json.table
            }
        }
        return table
    }
}

export function fetchColumns(schema_name: string, tableinfo_id: number) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/columninfo/fetch_for_table/", dispatch, {
            schema: schema_name,
            tableinfo_id: tableinfo_id,
        })

        dispatch(loadColumnsToAppCache(json["columns"]))
        dispatch(addColumns(Object.keys(json["columns"])))
    }
}

export function removeAllTables() {
    return (dispatch: Function) => {
        dispatch(addTables([]))
    }
}
export function removeAllColumns() {
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
export function fetchLiveResultForComponent(component: eEalUIComponent, state: IStore): IDataBrowserResult {
    const { databrowser } = state

    if (databrowser.component === component) {
        return {
            valid: databrowser.selectedColumns.length > 0,
            message: databrowser.message,
            columns: databrowser.selectedColumns,
        }
    }
    return { valid: false }
}

export function parseColumnsFromExpression(expression: string, expression_mode: eLayerValueExpressionMode | eLayerFilterExpressionMode) {
    const parsed: any = parse(expression)
    return parsed.filter((node: any) => node.isAccessorNode).map((node: any) => node.toString())
}

export function parseColumnsFromValueExpression(
    expression: string,
    expression_mode: eLayerValueExpressionMode,
    expression_side_to_parse: string = "both"
) {
    const parsed: any = parse(expression)
    let node
    if (expression_side_to_parse === "left") {
        node = parsed.args[0].content.args[0]
    } else if (expression_side_to_parse === "right") {
        node = parsed.args[0].content.args[1]
    } else if (expression_side_to_parse === "both") {
        node = parsed
    }
    return node.filter((node: any) => node.isAccessorNode).map((node: any) => node.toString())
}

export function getValueExpressionWithColumns(
    expression: any,
    expression_mode: eLayerValueExpressionMode,
    columninfo: IColumnInfo,
    geometry: IGeomTable
) {
    // FIXME Hacky for proof of concept component
    if (expression_mode === eLayerValueExpressionMode.SINGLE) {
        const columns: Array<string> = parseColumnsFromValueExpression(expression, expression_mode, "both")
        return {
            colgroup1: columns.map((column_uid: string) => getColumnByName(column_uid, columninfo, geometry)),
        }
    } else if (expression_mode === eLayerValueExpressionMode.PROPORTIONAL) {
        const colgroup1Columns: Array<string> = parseColumnsFromValueExpression(expression, expression_mode, "left")
        const colgroup2Columns: Array<string> = parseColumnsFromValueExpression(expression, expression_mode, "right")

        return {
            colgroup1: colgroup1Columns.map((column_uid: string) => getColumnByName(column_uid, columninfo, geometry)),
            colgroup2: colgroup2Columns.map((column_uid: string) => getColumnByName(column_uid, columninfo, geometry)),
        }
    } else if (expression_mode === eLayerValueExpressionMode.ADVANCED) {
        // throw Error("Umm, we can't do that yet.")
    }
    return {}
}

export function parseFilterExpression(expression: string, expression_mode: eLayerFilterExpressionMode) {
    // FIXME Hacky for proof of concept component
    if (expression_mode === eLayerFilterExpressionMode.SIMPLE) {
        let matches = /([a-z0-9$()<>*/]*?)([>=<!]{1,2})([a-z0-9]+)/g.exec(expression)
        return {
            col1: matches![1],
            operator: matches![2],
            col2: matches![3],
        }
    } else if (expression_mode === eLayerFilterExpressionMode.ADVANCED) {
        // throw Error("Umm, we can't do that yet.")
    }
    return {}
}

export function getFilterExpressionWithColumns(
    expression: any,
    expression_mode: eLayerFilterExpressionMode,
    columninfo: IColumnInfo,
    geometry: IGeomTable
) {
    // FIXME Hacky for proof of concept component
    if (expression_mode === eLayerFilterExpressionMode.SIMPLE) {
        const parsed: any = parseFilterExpression(expression, expression_mode)
        return {
            col1: getColumnByName(parsed.col1, columninfo, geometry) || parsed.col1,
            operator: parsed.operator,
            col2: getColumnByName(parsed.col2, columninfo, geometry) || parsed.col2,
        }
    } else if (expression_mode === eLayerFilterExpressionMode.ADVANCED) {
        // throw Error("Umm, we can't do that yet.")
    }
    return {}
}

// @FIXME Assumes column names are unique within a schema (which works OK for Census data). There's no guarnatee that they are, though.
function getColumnByName(column_schema_and_name: string, columninfo: IColumnInfo, geometry: IGeomTable) {
    const [schema_name, column_name] = column_schema_and_name.split(".")
    const result = objectEntries(columninfo).find(
        ([key, column]) =>
            column.name == column_name &&
            column.geometry_source_schema_name == geometry.schema_name &&
            column.geometry_source_id == geometry._id
    )

    if (result === undefined) {
        return undefined
    } else {
        const [column_uid, column] = result
        return column
    }
}

export function getTablesForMap(map: IMap, tableinfo: ITableInfo, columninfo: IColumnInfo, geominfo: IGeomInfo) {
    let tables: any = {}

    for (let layer of map["json"]["layers"]) {
        let columns: Array<any> = []

        if (layer.fill.expression_mode !== undefined) {
            columns = parseColumnsFromExpression(layer.fill.expression, layer.fill.expression_mode)
        }

        if (layer.fill.conditional_mode !== undefined) {
            columns = [...columns, ...parseColumnsFromExpression(layer.fill.conditional, layer.fill.conditional_mode)]
        }

        columns.forEach((column: string) => {
            const col: any = getColumnByName(column, columninfo, geominfo[`${layer.schema}.${layer.geometry}`])
            const tableUID = `${col.schema_name}.${col.table_info_id}`
            if (!(tableUID in tables)) {
                tables[tableUID] = tableinfo[tableUID]
            }
        })
    }

    return objectValues(tables)
}

export function removeColumnFromList(columns: Array<IColumn>, column: IColumn) {
    let tmpColumns = columns.slice()
    const idx: any = tmpColumns.findIndex((col: IColumn) => col.schema_name === column.schema_name && col.id === column.id)
    tmpColumns.splice(idx, 1)
    return tmpColumns
}
