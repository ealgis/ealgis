import { includes as arrayIncludes } from "core-js/library/fn/array";
import * as dotProp from "dot-prop-immutable";
import { merge } from "lodash-es";
import { browserHistory } from "react-router";
import { SubmissionError } from "redux-form";
import { IGeomTable, ISelectedColumn, IUserPartial, getGeomInfoFromState, getUserIdFromState } from "../../redux/modules/ealgis";
import * as layerFormModule from "../../redux/modules/layerform";
import { fetch as fetchLayerQuerySummary } from "../../redux/modules/layerquerysummary";
import { IPosition } from "../../redux/modules/map";
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars";
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics";
import { IEALGISApiClient } from "../../shared/api/EALGISApiClient";
import { getMapURL } from "../../shared/utils";
import { IConfig } from "./interfaces";

const Config: IConfig = require("Config") as any

// Actions
const LOAD = "ealgis/maps/LOAD"
const CREATE = "ealgis/maps/CREATE"
const DUPLICATE = "ealgis/maps/DUPLICATE"
const UPDATE = "ealgis/maps/UPDATE"
const SET_ORIGIN = "ealgis/maps/SET_ORIGIN"
const SET_SHARING = "ealgis/maps/SET_SHARING"
const DELETE_MAP = "ealgis/maps/DELETE_MAP"
const START_LAYER_EDITING = "ealgis/maps/START_LAYER_EDITING"
const FIT_LAYER_SCALE_TO_DATA = "ealgis/maps/FIT_LAYER_SCALE_TO_DATA"
const UPDATE_LAYER = "ealgis/maps/UPDATE_LAYER"
const ADD_LAYER = "ealgis/maps/ADD_LAYER"
const CLONE_MAP_LAYER = "ealgis/maps/CLONE_MAP_LAYER"
const SET_LAYER_VISIBILITY = "ealgis/maps/SET_LAYER_VISIBILITY"
const DELETE_LAYER = "ealgis/maps/DELETE_LAYER"
const CHANGE_LAYER_PROPERTY = "ealgis/maps/CHANGE_LAYER_PROPERTY"
const MERGE_LAYER_PROPERTIES = "ealgis/maps/MERGE_LAYER_PROPERTIES"
const EXPORT_MAP = "ealgis/maps/EXPORT_MAP"
const EXPORT_MAP_VIEWPORT = "ealgis/maps/EXPORT_MAP_VIEWPORT"
const COPY_SHAREABLE_LINK = "ealgis/maps/COPY_SHAREABLE_LINK"
const ADD_COLUMN_TO_SELECTION = "ealgis/maps/ADD_COLUMN_TO_SELECTION"

const initialState: IModule = {}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case LOAD:
            return action.maps
        case UPDATE:
            return dotProp.set(state, `${action.map!.id}`, action.map)
        case CREATE:
        case DUPLICATE:
            return {
                ...state,
                [action.map!.id]: action.map,
            }
        case SET_ORIGIN:
            return dotProp.set(state, `${action.mapId}.json.map_defaults`, {
                lon: action.position!.center![0],
                lat: action.position!.center![1],
                zoom: action.position!.zoom,
            })
        case SET_SHARING:
            return dotProp.set(state, `${action.mapId}.shared`, action.shared)
        case DELETE_MAP:
            let { [action.mapId!]: deletedItem, ...rest } = state
            return rest
        case UPDATE_LAYER:
        case ADD_LAYER:
            return dotProp.set(state, `${action.mapId}.json.layers.${action.layerId}`, action.layer)
        case CLONE_MAP_LAYER:
            let layerCopy = JSON.parse(JSON.stringify(state[action.mapId!].json.layers[action.layerId!]))
            layerCopy.name += " Copy"
            return dotProp.set(state, `${action.mapId}.json.layers`, [...state[action.mapId!].json.layers, layerCopy])
        case SET_LAYER_VISIBILITY:
            return dotProp.toggle(state, `${action.mapId}.json.layers.${action.layerId}.visible`)
        case DELETE_LAYER:
            return dotProp.delete(state, `${action.mapId}.json.layers.${action.layerId}`)
        case CHANGE_LAYER_PROPERTY:
            return dotProp.set(
                state,
                `${action.mapId}.json.layers.${action.layerId}.${action.layerPropertyPath}`,
                action.layerPropertyValue
            )
        case MERGE_LAYER_PROPERTIES:
            const newLayer = merge(dotProp.get(state, `${action.mapId}.json.layers.${action.layerId}`), action.layerPartial)
            return dotProp.set(state, `${action.mapId}.json.layers.${action.layerId}`, newLayer)
        case ADD_COLUMN_TO_SELECTION:
            const selectedColumns: Array<ISelectedColumn> =
                dotProp.get(state, `${action.mapId}.json.layers.${action.layerId}.selectedColumns`) || []

            if (arrayIncludes(selectedColumns, action.selectedColumn) == false) {
                return dotProp.set(state, `${action.mapId}.json.layers.${action.layerId}.selectedColumns`, [
                    ...selectedColumns,
                    action.selectedColumn,
                ])
            }
            return state
        default:
            return state
    }
}

// Action Creators
export function loadMaps(maps: Array<IMap>): IAction {
    return {
        type: LOAD,
        maps,
    }
}

export function receieveUpdatedMap(map: IMap): IAction {
    return {
        type: UPDATE,
        map,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function addMap(map: IMap): IAction {
    return {
        type: CREATE,
        map,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function addDuplicateMap(map: IMap): IAction {
    return {
        type: DUPLICATE,
        map,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function setMapOrigin(mapId: number, position: IPosition): IAction {
    return {
        type: SET_ORIGIN,
        mapId,
        position,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function setMapSharing(mapId: number, shared: eMapShared): IAction {
    return {
        type: SET_SHARING,
        mapId,
        shared,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function deleteMap(mapId: number): IAction {
    return {
        type: DELETE_MAP,
        mapId,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function startLayerEditing(): IAction {
    return {
        type: START_LAYER_EDITING,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function fitLayerScaleToData(): IAction {
    return {
        type: FIT_LAYER_SCALE_TO_DATA,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function receieveUpdatedLayer(mapId: number, layerId: number, layer: ILayer): IAction {
    return {
        type: UPDATE_LAYER,
        mapId,
        layerId,
        layer,
    }
}

export function addNewLayer(mapId: number, layerId: number, layer: ILayer): IAction {
    return {
        type: ADD_LAYER,
        mapId,
        layerId,
        layer,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function receiveCloneMapLayer(mapId: number, layerId: number): IAction {
    return {
        type: CLONE_MAP_LAYER,
        mapId,
        layerId,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function receiveChangeLayerVisibility(mapId: number, layerId: number): IAction {
    return {
        type: SET_LAYER_VISIBILITY,
        mapId,
        layerId,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function receiveDeleteMapLayer(mapId: number, layerId: number): IAction {
    return {
        type: DELETE_LAYER,
        mapId,
        layerId,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function receiveChangeLayerProperty(mapId: number, layerId: number, layerPropertyPath: string, layerPropertyValue: any): IAction {
    return {
        type: CHANGE_LAYER_PROPERTY,
        mapId,
        layerId,
        layerPropertyPath,
        layerPropertyValue,
    }
}

export function receiveMergeLayerProperties(mapId: number, layerId: number, layerPartial: object): IAction {
    return {
        type: MERGE_LAYER_PROPERTIES,
        mapId,
        layerId,
        layerPartial,
    }
}

export function exportMap(): IAction {
    return {
        type: EXPORT_MAP,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function exportMapViewport(includeGeomAttributes: boolean): IAction {
    return {
        type: EXPORT_MAP_VIEWPORT,
        meta: {
            analytics: {
                category: "Maps",
                payload: {
                    includeGeomAttributes: includeGeomAttributes,
                },
            },
        },
    }
}

export function copyShareableLink(): IAction {
    return {
        type: COPY_SHAREABLE_LINK,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function addColumnToLayerSelection(mapId: number, layerId: number, selectedColumn: ISelectedColumn): IAction {
    return {
        type: ADD_COLUMN_TO_SELECTION,
        mapId,
        layerId,
        selectedColumn,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

// Models
export interface IModule {
    [key: number]: IMap
}

export interface IAction {
    type: string
    meta?: {
        analytics: IAnalyticsMeta
    }
    maps?: Array<IMap>
    map?: IMap
    mapId?: number
    layer?: ILayer
    layerPartial?: Partial<ILayer>
    layerId?: number
    position?: IPosition
    shared?: eMapShared
    layerPropertyPath?: string
    layerPropertyValue?: any
    selectedColumn?: ISelectedColumn
}

export interface IMap {
    id: number
    name: string
    description: string
    json: {
        rev?: number
        show_legend: boolean
        layers: Array<ILayer>
        map_defaults: IMapPositionDefaults
    }
    shared: eMapShared
    owner_user_id: number
    owner: IUserPartial
    "name-url-safe": string
}
export enum eLayerValueExpressionMode {
    NOT_SET = 0,
    SINGLE = 1,
    PROPORTIONAL = 2,
    ADVANCED = 3,
}
export enum eLayerFilterExpressionMode {
    NOT_SET = 0,
    SIMPLE = 1,
    ADVANCED = 2,
}
export interface ILayer {
    [key: string]: any
    fill: {
        opacity: number
        scale_max: number
        scale_min: number
        expression: string
        expression_mode: eLayerValueExpressionMode
        scale_flip: boolean
        scale_name: string
        conditional: string
        conditional_mode: eLayerFilterExpressionMode
        scale_nlevels: number
    }
    hash?: string
    line: {
        width: number
        colour: {
            a: number
            r: number
            g: number
            b: number
        }
    }
    name: string
    type: string
    schema: string
    visible: boolean
    geometry: string
    olStyleDef?: Array<IOLStyleDef>
    olStyle?: any
    description: string
    latlon_bbox?: {
        maxx: number
        maxy: number
        minx: number
        miny: number
    }
    selectedColumns: Array<ISelectedColumn>
    _postgis_query?: string
}

export interface IOLStyleDef {
    expr: {
        from?: IOLStyleDefExpression
        to?: IOLStyleDefExpression
    }
    rgb: Array<number>
    opacity: number
}

export interface IOLStyleDefExpression {
    attr: string
    op: string
    v: number
}

export interface IMapPositionDefaults {
    lat: number
    lon: number
    zoom: number
}

export enum eMapShared {
    PRIVATE_SHARED = 1,
    AUTHENTICATED_USERS_SHARED = 2,
    PUBLIC_SHARED = 3,
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchMaps() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get("/api/0.1/maps/all/", dispatch)

        if (response.status === 200 && json.length > 0) {
            // Map maps from an array of objects to a dict keyed by mapId
            const maps = Object.assign({}, ...json.map((map: IMap, index: number, array: Array<IMap>) => ({ [map.id]: map })))
            dispatch(loadMaps(maps))
        }
    }
}

export function createMap(map: IMap) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        let mapCopy: IMap = JSON.parse(JSON.stringify(map))
        mapCopy["json"] = {
            // FIXME
            // DEFAULT_MAP_POSITION
            map_defaults: Config["DEFAULT_MAP_POSITION"],
            layers: [],
            show_legend: true,
        }

        return ealapi
            .post("/api/0.1/maps/", mapCopy, dispatch)
            .then(({ response, json }: any) => {
                // FIXME Cleanup and decide how to handle error at a component and application-level
                // throw new Error('Unhandled error creating map. Please report. (' + response.status + ') ' + JSON.stringify(json));

                if (response.status === 201) {
                    dispatch(addMap(json))
                    browserHistory.push(getMapURL(json))
                } else if (response.status === 400) {
                    // We expect that the server will return the shape:
                    // {
                    //   username: 'User does not exist',
                    //   password: 'Wrong password',
                    //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
                    // }
                    throw new SubmissionError({ ...json, _error: json.non_field_errors || null })
                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error("Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json))
                }
            })
            .catch((error: any) => {
                if (error instanceof SubmissionError) {
                    throw error
                } else {
                    throw new SubmissionError({ _error: error.message })
                }
            })
    }
}

export function updateMap(map: IMap) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        return ealapi.put("/api/0.1/maps/" + map["id"] + "/", map, dispatch).then(({ response, json }: any) => {
            // FIXME Cleanup and decide how to handle error at a component and application-level

            if (response.status === 200) {
                // dispatch(receieveUpdatedMap(json))
            } else if (response.status === 400) {
                // We expect that the server will return the shape:
                // {
                //   username: 'User does not exist',
                //   password: 'Wrong password',
                //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
                // }
                throw new SubmissionError({ ...json, _error: json.non_field_errors || null })
            } else {
                // We're not sure what happened, but handle it:
                // our Error will get passed straight to `.catch()`
                throw new Error("Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json))
            }
        })
    }
}

export function mapUpsert(map: IMap) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        // Upsert
        if (map.id === undefined) {
            return dispatch(createMap(map))
        }
        let mapCopy: IMap = JSON.parse(JSON.stringify(map))

        const { response, json } = await ealapi.put("/api/0.1/maps/" + mapCopy["id"] + "/", mapCopy, dispatch)

        // FIXME Cleanup and decide how to handle error at a component and application-level
        // throw new Error('Unhandled error updating map. Please report. (' + response.status + ') ' + JSON.stringify(json));

        if (response.status === 200) {
            dispatch(receieveUpdatedMap(json))
            browserHistory.push(getMapURL(json))
            dispatch(sendSnackbarNotification("Map saved successfully"))
        } else if (response.status === 400) {
            // We expect that the server will return the shape:
            // {
            //   username: 'User does not exist',
            //   password: 'Wrong password',
            //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
            // }
            throw new SubmissionError({ ...json, _error: json.non_field_errors || null })
        } else {
            // We're not sure what happened, but handle it:
            // our Error will get passed straight to `.catch()`
            throw new Error("Unhandled error updating map. Please report. (" + response.status + ") " + JSON.stringify(json))
        }
    }
}

export function updateMapOrigin(map: IMap, position: IPosition) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(setMapOrigin(map.id, position))

        // FIXME This getState() stuff *can't* be best practice
        return dispatch(updateMap(getMapFromState(getState, map.id))).then(() => {
            return dispatch(sendSnackbarNotification("Map starting position updated successfully"))
        })
    }
}

export function changeMapSharing(mapId: number, shared: eMapShared) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(setMapSharing(mapId, shared))
        dispatch(updateMap(getMapFromState(getState, mapId))).then(() => {
            dispatch(sendSnackbarNotification("Layer sharing settings updated"))
        })
    }
}

export function duplicateMap(mapId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        return ealapi
            .put("/api/0.1/maps/" + encodeURIComponent(mapId.toString()) + "/clone/", null, dispatch)
            .then(({ response, json }: any) => {
                if (response.status === 201) {
                    dispatch(addDuplicateMap(json))
                    dispatch(sendSnackbarNotification("Map duplicated successfully"))
                    browserHistory.push(getMapURL(json))
                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error("Unhandled error cloning map. Please report. (" + response.status + ") " + JSON.stringify(json))
                }
            })
    }
}

export function removeMap(mapId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        return ealapi.delete("/api/0.1/maps/" + encodeURIComponent(mapId.toString()) + "/", dispatch).then((response: any) => {
            if (response.status == 204) {
                dispatch(deleteMap(mapId))
                dispatch(sendSnackbarNotification("Map deleted successfully"))
                browserHistory.push("/maps")
            } else {
                throw new Error(response.statusText)
            }
        })
    }
}

export function addLayer(mapId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        // Default to 2011 SA4s or whatever the first geometry is
        // FIXME Have schemas nominate their default geometry and set that here or in Python-land in /addLayer
        const geominfo = getGeomInfoFromState(getState)
        let defaultGeometry: IGeomTable

        if (geominfo["aus_census_2011.sa4_2011_aust_pow"] !== undefined) {
            defaultGeometry = geominfo["aus_census_2011.sa4_2011_aust_pow"]
        } else {
            defaultGeometry = geominfo[Object.keys(geominfo)[0]]
        }

        const payload = {
            layer: {
                fill: {
                    opacity: 0.5,
                    scale_max: 100,
                    scale_min: 0,
                    expression: "",
                    scale_flip: false,
                    scale_name: "Huey",
                    conditional: "",
                    scale_nlevels: 6,
                },
                line: {
                    width: 1,
                    colour: {
                        r: "0",
                        g: "0",
                        b: "0",
                        a: "1",
                    },
                },
                name: "Unnamed Layer",
                type: defaultGeometry["geometry_type"],
                schema: defaultGeometry["schema_name"],
                visible: true,
                geometry: defaultGeometry["name"],
                description: "",
                selectedColumns: [],
            },
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/addLayer/`, payload, dispatch).then(({ response, json }: any) => {
            if (response.status === 201) {
                dispatch(addNewLayer(mapId, json.layerId, json.layer))
                dispatch(sendSnackbarNotification(`Layer created successfully`))
                browserHistory.push(getMapURL(getMapFromState(getState, mapId)) + `/layer/${json.layerId}/`)
            }
        })
    }
}

export function cloneMapLayer(mapId: number, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(receiveCloneMapLayer(mapId, layerId))
        dispatch(updateMap(getMapFromState(getState, mapId)))
        dispatch(sendSnackbarNotification("Layer cloned successfully"))
    }
}

export function changeLayerVisibility(map: IMap, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(receiveChangeLayerVisibility(map["id"], layerId))

        if (getUserIdFromState(getState) === map.owner_user_id) {
            // FIXME Client-side or make the API accept a layer object to merge for /publishLayer
            const layer = getMapFromState(getState, map["id"]).json.layers[layerId]
            dispatch(updateLayer(map["id"], layerId, layer))
        }
    }
}

export function deleteMapLayer(map: IMap, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        let mapCopy: IMap = JSON.parse(JSON.stringify(map))
        if (mapCopy["json"]["layers"][layerId] !== undefined) {
            mapCopy["json"]["layers"].splice(layerId, 1)
        }

        return ealapi.put("/api/0.1/maps/" + mapCopy["id"] + "/", mapCopy, dispatch).then(({ response, json }: any) => {
            // FIXME Cleanup and decide how to handle error at a component and application-level
            if (response.status === 200) {
                dispatch(receiveDeleteMapLayer(map.id, layerId))
                // browserHistory.push("/map/" + json.id)
            } else if (response.status === 400) {
                // We expect that the server will return the shape:
                // {
                //   username: 'User does not exist',
                //   password: 'Wrong password',
                //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
                // }
                throw new SubmissionError({ ...json, _error: json.non_field_errors || null })
            } else {
                // We're not sure what happened, but handle it:
                // our Error will get passed straight to `.catch()`
                throw new Error("Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json))
            }
        })
    }
}

export function initDraftLayer(mapId: number, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const payload = { layerId: layerId }
        return ealapi.put(`/api/0.1/maps/${mapId}/initDraftLayer/`, payload, dispatch)
    }
}

export function handleLayerFormChange(layerPartial: Partial<ILayer>, mapId: number, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        // Determine if we need to recompile the layer server-side.
        // e.g. Recompile the SQL expression, recompile the layer styles, et cetera
        let willCompileServerSide: boolean = false
        if ("geometry" in layerPartial) {
            willCompileServerSide = true
        }
        if (!willCompileServerSide && "fill" in layerPartial) {
            willCompileServerSide = Object.keys(layerPartial["fill"]!).some((value: string, index: number, array: Array<string>) => {
                return ["expression", "conditional"].indexOf(value) >= 0
            })
        }

        // Where possible, simply merge our partial layer object into the Redux store.
        if (!willCompileServerSide) {
            return dispatch(receiveMergeLayerProperties(mapId, layerId, layerPartial))
        } else {
            return dispatch(editDraftLayer(mapId, layerId, layerPartial)).then((layer: ILayer) => {
                if (typeof layer === "object") {
                    // Refresh layer query summary if any of the core fields change (i.e. Fields that change the PostGIS query)
                    let haveCoreFieldsChanged: boolean = false
                    if ("fill" in layerPartial) {
                        haveCoreFieldsChanged = Object.keys(layerPartial["fill"]!).some(
                            (value: string, index: number, array: Array<string>) => {
                                return ["expression", "conditional"].indexOf(value) >= 0
                            }
                        )
                    }

                    if (haveCoreFieldsChanged || "geometry" in layerPartial) {
                        dispatch(fetchLayerQuerySummary(mapId, layer.hash!))
                    }
                }
            })
        }
    }
}

export function updateLayer(mapId: number, layerId: number, layer: ILayer) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const payload = {
            layerId: layerId,
            layer: JSON.parse(JSON.stringify(layer)),
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/publishLayer/`, payload, dispatch)
    }
}

export function publishLayer(mapId: number, layerId: number, layer: ILayer) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(layerFormModule.beginPublish())

        return dispatch(updateLayer(mapId, layerId, layer)).then(({ response, json }: any) => {
            if (response.status === 200) {
                dispatch(layerFormModule.finishedSubmitting())
                dispatch(receieveUpdatedLayer(mapId, layerId, json))
                dispatch(sendSnackbarNotification(`Layer saved successfully`))
                browserHistory.push(getMapURL(getMapFromState(getState, mapId)))
                return json
            } else {
                const message = Object.keys(json).map((key: any, index: any) => {
                    return `${key}: ${json[key].toLowerCase()}`
                })
                dispatch(sendSnackbarNotification(`Errors publishing layer: ${message.join(", ")}`))
            }
        })
    }
}

export function restoreMasterLayer(mapId: number, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(layerFormModule.beginRestoreMaster())

        const payload = {
            layerId: layerId,
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/restoreMasterLayer/`, payload, dispatch).then(({ response, json }: any) => {
            if (response.status === 200) {
                dispatch(layerFormModule.finishedSubmitting())
                dispatch(receieveUpdatedLayer(mapId, layerId, json))
                // dispatch(sendSnackbarNotification(`Layer restored successfully`))
                // browserHistory.push(`/map/${mapId}`)
                return json
            }
        })
    }
}

export function restoreMasterLayerAndDiscardForm(mapId: number, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        return dispatch(restoreMasterLayer(mapId, layerId)).then(() => {
            browserHistory.push(getMapURL(getMapFromState(getState, mapId)))
        })
    }
}

export function editDraftLayer(mapId: number, layerId: number, layerPartial: object) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const payload = {
            layerId: layerId,
            layer: layerPartial,
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/editDraftLayer/`, payload, dispatch).then(({ response, json }: any) => {
            if (response.status === 200) {
                dispatch(receieveUpdatedLayer(mapId, layerId, json))
                return json
            } else if (response.status === 400) {
                dispatch(layerFormModule.loadValidationErrors(json))
            } else {
                // We're not sure what happened, but handle it:
                // our Error will get passed straight to RavenJS (Sentry.io)
                throw new Error("Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json))
            }
        })
    }
}

// Helper methods
export function getMapFromState(getState: Function, mapId: number) {
    return getState().maps[mapId]
}
