import * as dotProp from "dot-prop-immutable"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { ITable } from "../../redux/modules/datasearch"
import { loading as appLoading, loaded as appLoaded } from "./app"
import { fetchMaps } from "./maps"

// Actions
const LOAD_USER = "ealgis/ealgis/LOAD_USER"
const LOAD_GEOM = "ealgis/ealgis/LOAD_GEOM"
const LOAD_COLOURS = "ealgis/ealgis/LOAD_COLOURS"
const LOAD_TABLES = "ealgis/ealgis/LOAD_TABLES"
const LOAD_SCHEMAS = "ealgis/ealgis/LOAD_SCHEMAS"

const initialState: IModule = {
    user: {} as IUser,
    geominfo: {},
    tableinfo: {},
    colourinfo: {},
    schemainfo: {},
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_USER:
            return dotProp.set(state, "user", action.user)
        case LOAD_GEOM:
            return dotProp.set(state, "geominfo", action.geominfo)
        case LOAD_COLOURS:
            return dotProp.set(state, "colourinfo", action.colourinfo)
        case LOAD_TABLES:
            return dotProp.set(state, "tableinfo", action.tableinfo)
        case LOAD_SCHEMAS:
            return dotProp.set(state, "schemainfo", action.schemainfo)
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

export function loadSchemas(schemainfo: ISchemaInfo) {
    return {
        type: LOAD_SCHEMAS,
        schemainfo,
    }
}

// Models
export interface IModule {
    user: IUser
    geominfo: IGeomInfo
    colourinfo: IColourInfo
    tableinfo: ITableInfo
    schemainfo: ISchemaInfo
}

export interface IAction {
    type: string
    user: IUser
    geominfo: IGeomInfo
    tableinfo: ITableInfo
    colourinfo: IColourInfo
    schemainfo: ISchemaInfo
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

export interface ITableInfo {
    [key: number]: ITable
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

export interface IGeomTable {
    _id: number
    description: string
    geometry_type: string
    name: string
    schema_name: string
}

export interface ISchema {
    _id: number
    name: string
    version: number
    description: string
    family: string
    date: string
}

export interface ISchemaInfo {
    [key: string]: ISchema
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchUserMapsDataColourAndSchemaInfo() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(appLoading())

        const self: ISelf = await dispatch(fetchUser())
        if (self.is_logged_in && self.user.is_approved) {
            await Promise.all([
                dispatch(fetchMaps()),
                dispatch(fetchGeomInfo()),
                dispatch(fetchColourInfo()),
                dispatch(fetchSchemaInfo()),
            ])
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

export function fetchGeomInfo() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/datainfo/", dispatch)

        const ordered: IGeomInfo = {}
        Object.keys(json).sort().forEach(function(key: string) {
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

// Helper methods
export function getUserIdFromState(getState: Function) {
    return getState().ealgis["user"].id
}

export function getGeomInfoFromState(getState: Function) {
    return getState().ealgis.geominfo
}
