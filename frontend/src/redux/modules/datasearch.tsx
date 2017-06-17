import * as dotProp from "dot-prop-immutable"
import { loadTables } from "../../redux/modules/ealgis"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"

// Actions
const LOAD = "ealgis/datasearch/LOAD"
const RESET = "ealgis/datasearch/RESET"

const initialState = {
    results: [],
}

// Reducer
export default function reducer(state = initialState, action = {}) {
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
export function load(results: object) {
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

export function reset() {
    return {
        type: RESET,
    }
}

// Models

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchColumnsForTable(chips: Array<string>, geometry: object, table_names: Array<string>) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(reset())

        return dispatch(getColumnsForTable(chips, geometry, table_names)).then(({ response, json }) => {
            processResults(response, json, dispatch)
        })
    }
}

export function fetchColumnsByName(chips: Array<string>, geometry: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(reset())

        return dispatch(getColumnsByName(chips, geometry)).then(({ response, json }) => {
            processResults(response, json, dispatch)
        })
    }
}

export function fetchColumnsForGeometry(chips: Array<string>, geometry: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(reset())

        return dispatch(getColumnsForGeometry(chips, geometry)).then(({ response, json }) => {
            processResults(response, json, dispatch)
        })
    }
}

export function getColumnsForTable(chips: Array<string>, geometry: object, table_names: Array<string>) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        const params = {
            search: chips.join(","),
            schema: geometry["schema_name"],
            tableinfo_name: table_names.join(","),
        }
        return ealapi.get("/api/0.1/columninfo/search/", dispatch, params)
    }
}

export function getColumnsForGeometry(chips: Array<string>, geometry: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        const params = {
            search: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        }
        return ealapi.get("/api/0.1/columninfo/search/", dispatch, params)
    }
}

export function getColumnsByName(chips: Array<string>, geometry: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        const params = {
            name: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        }
        return ealapi.get("/api/0.1/columninfo/by_name/", dispatch, params)
    }
}

export function processResults(response: object, json: object, dispatch: Function) {
    if (response.status === 404) {
        dispatch(sendSnackbarNotification("No columns found matching your search criteria."))
        return
    }

    dispatch(loadTables(json["tables"]))

    let columnsByTable = {}
    for (let key in json["columns"]) {
        const col = json["columns"][key]
        if (columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]] === undefined) {
            columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]] = {
                table: json["tables"][col["tableinfo_id"]],
                columns: [],
            }
        }
        columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]].columns.push(col)
    }
    dispatch(load(columnsByTable))
}
