import * as dotProp from "dot-prop-immutable"
import { loading as appLoading, loaded as appLoaded } from "./app"
import { fetchMaps } from "./maps"

// Actions
const LOAD_USER = "ealgis/ealgis/LOAD_USER"
const LOAD_GEOM = "ealgis/ealgis/LOAD_GEOM"
const LOAD_COLOURS = "ealgis/ealgis/LOAD_COLOURS"
const LOAD_TABLES = "ealgis/ealgis/LOAD_TABLES"

const initialState = {
    user: {
        url: null,
    },
    geominfo: {},
    tableinfo: {},
    colourinfo: {},
}

// Reducer
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case LOAD_USER:
            return dotProp.set(state, "user", action.json)
        case LOAD_GEOM:
            return dotProp.set(state, "geominfo", action.json)
        case LOAD_COLOURS:
            return dotProp.set(state, "colourinfo", action.json)
        case LOAD_TABLES:
            return dotProp.set(state, "tableinfo", action.json)
        default:
            return state
    }
}

// Action Creators
export function loadUser(json: any) {
    return {
        type: LOAD_USER,
        json,
    }
}

export function loadGeom(json: any) {
    return {
        type: LOAD_GEOM,
        json,
    }
}

export function loadColours(json: any) {
    return {
        type: LOAD_COLOURS,
        json,
    }
}

export function loadTables(json: any) {
    return {
        type: LOAD_TABLES,
        json,
    }
}

// Models

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchUserMapsDataAndColourInfo() {
    return async (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(appLoading())

        const user = await dispatch(fetchUser())
        if (user.id !== null) {
            await Promise.all([dispatch(fetchMaps()), dispatch(fetchGeomInfo()), dispatch(fetchColourInfo())])
        }

        dispatch(appLoaded())
    }
}

export function fetchUser() {
    return async (dispatch: Function, getState: Function, ealapi: object) => {
        const { response, json } = await ealapi.get("/api/0.1/self", dispatch)
        dispatch(loadUser(json))
        return json
    }
}

export function logoutUser() {
    return async (dispatch: Function, getState: Function, ealapi: object) => {
        await ealapi.get("/api/0.1/logout", dispatch)
        window.location.reload()
    }
}

export function fetchGeomInfo() {
    return async (dispatch: Function, getState: Function, ealapi: object) => {
        const { response, json } = await ealapi.get("/api/0.1/datainfo/", dispatch)

        const ordered = {}
        Object.keys(json).sort().forEach(function(key) {
            ordered[key] = json[key]
        })
        dispatch(loadGeom(ordered))
    }
}

export function fetchColourInfo() {
    return async (dispatch: Function, getState: Function, ealapi: object) => {
        const { response, json } = await ealapi.get("/api/0.1/colours/", dispatch)
        dispatch(loadColours(json))
    }
}

// Helper methods
export function getUserIdFromState(getState: Function) {
    return getState().ealgis["user"].id
}

export function getGeomInfoFromState(getState: Function) {
    return getState().ealgis.geominfo
}
