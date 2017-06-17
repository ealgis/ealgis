import * as dotProp from "dot-prop-immutable"
import * as merge from "lodash/merge"
import { browserHistory } from "react-router"
import { getMapURL } from "../../shared/utils"
import { SubmissionError } from "redux-form"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { getUserIdFromState, getGeomInfoFromState } from "../../redux/modules/ealgis"

import * as layerFormModule from "../../redux/modules/layerform"
import { fetch as fetchLayerQuerySummary } from "../../redux/modules/layerquerysummary"

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

// Reducer
export default function reducer(state = {}, action = {}) {
    switch (action.type) {
        case LOAD:
            return action.maps
        case UPDATE:
            return dotProp.set(state, `${action.map.id}`, action.map)
        case CREATE:
        case DUPLICATE:
            return {
                ...state,
                [action.map.id]: action.map,
            }
        case SET_ORIGIN:
            return dotProp.set(state, `${action.mapId}.json.map_defaults`, {
                lat: action.position.center.lat,
                lon: action.position.center.lon,
                zoom: action.position.zoom,
            })
        case SET_SHARING:
            return dotProp.set(state, `${action.mapId}.shared`, action.shared)
        case DELETE_MAP:
            let { [action.mapId]: deletedItem, ...rest } = state
            return rest
        case UPDATE_LAYER:
        case ADD_LAYER:
            return dotProp.set(state, `${action.mapId}.json.layers.${action.layerId}`, action.layer)
        case CLONE_MAP_LAYER:
            let layerCopy = JSON.parse(JSON.stringify(state[action.mapId].json.layers[action.layerId]))
            layerCopy.name += " Copy"
            return dotProp.set(state, `${action.mapId}.json.layers`, [...state[action.mapId].json.layers, layerCopy])
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
            const newLayer = merge(dotProp.get(state, `${action.mapId}.json.layers.${action.layerId}`), action.layer)
            return dotProp.set(state, `${action.mapId}.json.layers.${action.layerId}`, newLayer)
        default:
            return state
    }
}

// Action Creators
export function loadMaps(maps: object) {
    return {
        type: LOAD,
        maps,
    }
}

export function receieveUpdatedMap(map: Map) {
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

export function addMap(map: Map) {
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

export function addDuplicateMap(map: Map) {
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

export function setMapOrigin(mapId: number, position: MapPosition) {
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

export function setMapSharing(mapId: number, shared: number) {
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

export function deleteMap(mapId: number) {
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

export function startLayerEditing() {
    return {
        type: START_LAYER_EDITING,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function fitLayerScaleToData() {
    return {
        type: FIT_LAYER_SCALE_TO_DATA,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function receieveUpdatedLayer(mapId: number, layerId: number, layer: Layer) {
    return {
        type: UPDATE_LAYER,
        mapId,
        layerId,
        layer,
    }
}

export function addNewLayer(mapId: number, layerId: number, layer: Layer) {
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

export function receiveCloneMapLayer(mapId: number, layerId: number) {
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

export function receiveChangeLayerVisibility(mapId: number, layerId: number) {
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

export function receiveDeleteMapLayer(mapId: number, layerId: number) {
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

export function receiveChangeLayerProperty(
    mapId: number,
    layerId: number,
    layerPropertyPath: string,
    layerPropertyValue: any
) {
    return {
        type: CHANGE_LAYER_PROPERTY,
        mapId,
        layerId,
        layerPropertyPath,
        layerPropertyValue,
    }
}

export function receiveMergeLayerProperties(mapId: number, layerId: number, layer: object) {
    return {
        type: MERGE_LAYER_PROPERTIES,
        mapId,
        layerId,
        layer,
    }
}

export function exportMap() {
    return {
        type: EXPORT_MAP,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

export function exportMapViewport(includeGeomAttributes: boolean) {
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

export function copyShareableLink() {
    return {
        type: COPY_SHAREABLE_LINK,
        meta: {
            analytics: {
                category: "Maps",
            },
        },
    }
}

// Models
export type Map = {
    id: number
    name: string
}

export type MapPosition = {
    lat: number
    lon: number
    zoom: number
}

export type MapSharing = {
    level: number
}

export type Layer = {
    id: number
    name: string
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchMaps() {
    return async (dispatch: Function, getState: Function, ealapi: object) => {
        const { response, json } = await ealapi.get("/api/0.1/maps/all/", dispatch)

        if (response.status === 200 && json.length > 0) {
            // Map maps from an array of objects to a dict keyed by mapId
            const maps = Object.assign(...json.map(d => ({ [d.id]: d })))
            dispatch(loadMaps(maps))
        }
    }
}

export function createMap(map: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        let mapCopy: object = JSON.parse(JSON.stringify(map))
        mapCopy["json"] = {
            // FIXME
            map_defaults: {
                lat: -27.121915157767,
                lon: 133.21253738715,
                zoom: 4,
            },
            layers: [],
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
                    throw new Error(
                        "Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json)
                    )
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

export function updateMap(map: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
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
                throw new Error(
                    "Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json)
                )
            }
        })
    }
}

export function mapUpsert(map: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        // Upsert
        if (map.id === undefined) {
            return dispatch(createMap(map))
        }
        let mapCopy: object = JSON.parse(JSON.stringify(map))

        return ealapi.put("/api/0.1/maps/" + mapCopy["id"] + "/", mapCopy, dispatch).then(({ response, json }: any) => {
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
                throw new Error(
                    "Unhandled error updating map. Please report. (" + response.status + ") " + JSON.stringify(json)
                )
            }
        })
    }
}

export function updateMapOrigin(map: object, position: MapPosition) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(setMapOrigin(map.id, position))

        // FIXME This getState() stuff *can't* be best practice
        return dispatch(updateMap(getMapFromState(getState, map.id))).then(() => {
            return dispatch(sendSnackbarNotification("Map starting position updated successfully"))
        })
    }
}

export function changeMapSharing(mapId: number, shared: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(setMapSharing(mapId, shared))
        dispatch(updateMap(getMapFromState(getState, mapId))).then(() => {
            dispatch(sendSnackbarNotification("Layer sharing settings updated"))
        })
    }
}

export function duplicateMap(mapId: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
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
                    throw new Error(
                        "Unhandled error cloning map. Please report. (" + response.status + ") " + JSON.stringify(json)
                    )
                }
            })
    }
}

export function removeMap(mapId: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        return ealapi
            .delete("/api/0.1/maps/" + encodeURIComponent(mapId.toString()) + "/", dispatch)
            .then((response: any) => {
                if (response.status == 204) {
                    dispatch(deleteMap(mapId))
                    dispatch(sendSnackbarNotification("Map deleted successfully"))
                    browserHistory.push("/maps")
                } else {
                    var error = new Error(response.statusText)
                    error.response = response
                    // dispatch(deleteMapError(error));
                    throw error
                }
            })
    }
}

export function addLayer(mapId: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        // Default to 2011 SA4s or whatever the first geometry is
        // FIXME Have schemas nominate their default geometry and set that here or in Python-land in /addLayer
        const geominfo = getGeomInfoFromState(getState)
        let defaultGeometry: object = undefined

        if (geominfo["aus_census_2011.sa4_2011_aust_pow"] !== undefined) {
            defaultGeometry = geominfo["aus_census_2011.sa4_2011_aust_pow"]
        } else {
            defaultGeometry = geominfo(Object.keys(geominfo)[0])
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
                        r: "51",
                        g: "105",
                        b: "30",
                        a: "1",
                    },
                },
                name: "Unnamed Layer",
                type: defaultGeometry["geometry_type"],
                schema: defaultGeometry["schema_name"],
                visible: true,
                geometry: defaultGeometry["name"],
                description: "",
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
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(receiveCloneMapLayer(mapId, layerId))
        dispatch(updateMap(getMapFromState(getState, mapId)))
        dispatch(sendSnackbarNotification("Layer cloned successfully"))
    }
}

export function changeLayerVisibility(map: object, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(receiveChangeLayerVisibility(map["id"], layerId))

        if (getUserIdFromState(getState) === map.owner_user_id) {
            // FIXME Client-side or make the API accept a layer object to merge for /publishLayer
            const layer = getMapFromState(getState, map["id"]).json.layers[layerId]
            dispatch(updateLayer(map["id"], layerId, layer))
        }
    }
}

export function deleteMapLayer(map: object, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        let mapCopy: object = JSON.parse(JSON.stringify(map))
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
                throw new Error(
                    "Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json)
                )
            }
        })
    }
}

export function initDraftLayer(mapId: number, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        const payload = { layerId: layerId }
        return ealapi.put(`/api/0.1/maps/${mapId}/initDraftLayer/`, payload, dispatch)
    }
}

export function handleLayerFormChange(layerPartial: object, mapId: number, layerId: number) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        // Determine if we need to recompile the layer server-side.
        // e.g. Recompile the SQL expression, recompile the layer styles, et cetera
        let willCompileServerSide: boolean = false
        if ("geometry" in layerPartial) {
            willCompileServerSide = true
        }
        if (!willCompileServerSide && "fill" in layerPartial) {
            willCompileServerSide = Object.keys(
                layerPartial["fill"]
            ).some((value: string, index: number, array: Array<string>) => {
                return (
                    [
                        "scale_min",
                        "scale_max",
                        "expression",
                        "conditional",
                        "scale_flip",
                        "scale_name",
                        "scale_nlevels",
                    ].indexOf(value) >= 0
                )
            })
        }

        // Where possible, simply merge our partial layer object into the Redux store.
        if (!willCompileServerSide) {
            return dispatch(receiveMergeLayerProperties(mapId, layerId, layerPartial))
        } else {
            return dispatch(editDraftLayer(mapId, layerId, layerPartial)).then((layer: object) => {
                if (typeof layer === "object") {
                    // Refresh layer query summary if any of the core fields change (i.e. Fields that change the PostGIS query)
                    let haveCoreFieldsChanged: boolean = false
                    if ("fill" in layerPartial) {
                        haveCoreFieldsChanged = Object.keys(
                            layerPartial["fill"]
                        ).some((value: string, index: number, array: Array<string>) => {
                            return ["scale_min", "scale_max", "expression", "conditional"].indexOf(value) >= 0
                        })
                    }

                    if (haveCoreFieldsChanged || "geometry" in layerPartial) {
                        dispatch(fetchLayerQuerySummary(mapId, layer.hash))
                    }
                }
            })
        }
    }
}

export function updateLayer(mapId: number, layerId: number, layer: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        const payload = {
            layerId: layerId,
            layer: JSON.parse(JSON.stringify(layer)),
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/publishLayer/`, payload, dispatch)
    }
}

export function publishLayer(mapId: number, layerId: number, layer: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
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
    return (dispatch: Function, getState: Function, ealapi: object) => {
        dispatch(layerFormModule.beginRestoreMaster())

        const payload = {
            layerId: layerId,
        }

        return ealapi
            .put(`/api/0.1/maps/${mapId}/restoreMasterLayer/`, payload, dispatch)
            .then(({ response, json }: any) => {
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
    return (dispatch: Function, getState: Function, ealapi: object) => {
        return dispatch(restoreMasterLayer(mapId, layerId)).then(() => {
            browserHistory.push(getMapURL(getMapFromState(getState, mapId)))
        })
    }
}

export function editDraftLayer(mapId: number, layerId: number, layerPartial: object) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        const payload = {
            layerId: layerId,
            layer: layerPartial,
        }

        return ealapi
            .put(`/api/0.1/maps/${mapId}/editDraftLayer/`, payload, dispatch)
            .then(({ response, json }: any) => {
                if (response.status === 200) {
                    dispatch(receieveUpdatedLayer(mapId, layerId, json))
                    return json
                } else if (response.status === 400) {
                    dispatch(layerFormModule.loadValidationErrors(json))
                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error(
                        "Unhandled error creating map. Please report. (" + response.status + ") " + JSON.stringify(json)
                    )
                }
            })
    }
}

// Helper methods
export function getMapFromState(getState: Function, mapId: number) {
    return getState().maps[mapId]
}
