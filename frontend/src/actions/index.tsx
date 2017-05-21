import Promise from 'promise-polyfill'
import 'whatwg-fetch'
import { browserHistory } from 'react-router';
import cookie from 'react-cookie'
import { getFormValues } from 'redux-form';
import { compileLayerStyle } from '../utils/OLStyle'
import { SubmissionError } from 'redux-form'
import { EALGISApiClient } from '../helpers/EALGISApiClient';
import { getMapURL } from '../utils/utils';
import LayerFormContainer from "../components/LayerFormContainer"

export const RECEIVE_APP_LOADED = 'RECEIVE_APP_LOADED'
export const RECEIVE_TOGGLE_SIDEBAR_STATE = 'RECEIVE_TOGGLE_SIDEBAR_STATE'
export const RECEIVE_NEW_SNACKBAR_MESSAGE = 'RECEIVE_NEW_SNACKBAR_MESSAGE'
export const RECEIVE_START_SNACKBAR_IF_NEEDED = 'RECEIVE_START_SNACKBAR_IF_NEEDED'
export const RECEIVE_ITERATE_SNACKBAR = 'RECEIVE_ITERATE_SNACKBAR'
export const RECEIVE_MAP_POSITION = 'RECEIVE_MAP_POSITION'
export const RECEIVE_SET_MAP_ORIGIN = 'RECEIVE_SET_MAP_ORIGIN'
export const RECEIVE_RESET_MAP_POSITION = 'RECEIVE_RESET_MAP_POSITION'
export const RECEIVE_TOGGLE_MAP_VIEW_SETTING = 'RECEIVE_TOGGLE_MAP_VIEW_SETTING'
export const REQUEST_USER = 'REQUEST USER'
export const RECEIVE_USER = 'RECEIVE_USER'
export const REQUEST_MAPS = 'REQUEST MAPS'
export const RECEIVE_MAPS = 'RECEIVE_MAPS'
export const REQUEST_MAP_DEFINITION = 'REQUEST_MAP_DEFINITION'
export const RECEIVE_MAP_DEFINITION = 'RECEIVE_MAP_DEFINITION'
export const DELETE_MAP = 'DELETE_MAP'
export const CREATE_MAP = 'CREATE_MAP'
export const COMPILED_LAYER_STYLE = 'COMPILED_LAYER_STYLE'
export const CHANGE_MAP_SHARING = 'CHANGE_MAP_SHARING'
export const CHANGE_LAYER_VISIBILITY = 'CHANGE_LAYER_VISIBILITY'
export const REQUEST_DATA_INFO = 'REQUEST_DATA_INFO'
export const RECEIVE_DATA_INFO = 'RECEIVE_DATA_INFO'
export const REQUEST_COLOUR_INFO = 'REQUEST_COLOUR_INFO'
export const RECEIVE_COLOUR_INFO = 'RECEIVE_COLOUR_INFO'
export const RECEIVE_UPDATED_MAP = 'RECEIVE_UPDATED_MAP'
export const RECEIVE_UPDATED_LAYER = 'RECEIVE_UPDATED_LAYER'
export const RECEIVE_DELETE_MAP_LAYER = 'RECEIVE_DELETE_MAP_LAYER'
export const RECEIVE_CLONE_MAP_LAYER = 'RECEIVE_CLONE_MAP_LAYER'
export const RECEIVE_TOGGLE_MODAL_STATE = 'RECEIVE_TOGGLE_MODAL_STATE'
export const RECEIVE_UPDATE_DATA_INSPECTOR = 'RECEIVE_UPDATE_DATA_INSPECTOR'
export const RECEIVE_RESET_DATA_INSPECTOR = 'RECEIVE_RESET_DATA_INSPECTOR'
export const RECEIVE_TOGGLE_DEBUG_MODE = 'RECEIVE_TOGGLE_DEBUG_MODE'
export const RECEIVE_REQUEST_BEGIN_FETCH = 'RECEIVE_REQUEST_BEGIN_FETCH'
export const RECEIVE_REQUEST_FINISH_FETCH = 'RECEIVE_REQUEST_FINISH_FETCH'
export const RECEIVE_UPDATE_DATA_DISCOVERY = 'RECEIVE_UPDATE_DATA_DISCOVERY'
export const RECEIVE_RESET_DATA_DISCOVERY = 'RECEIVE_RESET_DATA_DISCOVERY'
export const RECEIVE_TABLE_INFO = 'RECEIVE_TABLE_INFO'
export const RECEIVE_TOGGLE_LAYERFORM_SUBMITTING = 'RECEIVE_TOGGLE_LAYERFORM_SUBMITTING'
export const RECEIVE_CHIP_VALUES = 'RECEIVE_CHIP_VALUES'
export const RECEIVE_APP_PREVIOUS_PATH = 'RECEIVE_APP_PREVIOUS_PATH'
export const CHANGE_LAYER_PROPERTY = 'CHANGE_LAYER_PROPERTY'
export const MERGE_LAYER_PROPERTIES = 'MERGE_LAYER_PROPERTIES'
export const RECEIVE_LAYER_QUERY_SUMMARY = 'RECEIVE_LAYER_QUERY_SUMMARY'
export const RECEIVE_LAYERFORM_ERRORS = 'RECEIVE_LAYERFORM_ERRORS'
export const RECEIVE_LEGENDPEEK_LABEL = 'RECEIVE_LEGENDPEEK_LABEL'
export const RECEIVE_SET_USER_MENU_STATE = 'RECEIVE_SET_USER_MENU_STATE'

const ealapi = new EALGISApiClient()

export function requestUser() {
    return {
        type: REQUEST_USER
    }
}

export function receiveUser(json: any) {
    return {
        type: RECEIVE_USER,
        json
    }
}

export function requestMaps() {
    return {
        type: REQUEST_MAPS
    }
}

export function receiveMaps(maps: object) {
    return {
        type: RECEIVE_MAPS,
        maps
    }
}

export function requestMapDefinition() {
    return {
        type: REQUEST_MAP_DEFINITION
    }
}

export function receiveChangeLayerVisibility(mapId: number, layerId: number) {
    return {
        type: CHANGE_LAYER_VISIBILITY,
        mapId,
        layerId,
    }
}

export function changeLayerVisibility(map: object, layerId: number) {
    return (dispatch: any, getState: Function) => {
        dispatch(receiveChangeLayerVisibility(map["id"], layerId))

        if(getState()["user"].id === map.owner_user_id) {
            // FIXME Client-side or make the API accept a layer object to merge for /publishLayer
            const layer = getState().maps[map["id"]].json.layers[layerId]
            dispatch(updateLayer(map["id"], layerId, layer))
        }
    }
}

export function receiveDeleteMap(mapId: number) {
    return (dispatch: any) => {
        dispatch({
            type: DELETE_MAP,
            mapId
        })
    }
}

export function receiveCreatedMap(map: object) {
    return (dispatch: any) => {
        dispatch({
            type: CREATE_MAP,
            map
        })
    }
}

export function receiveCompiledLayerStyle(mapId: number, layerId: number, olStyle: any) {
    return {
        type: COMPILED_LAYER_STYLE,
        mapId,
        layerId,
        olStyle,
    }
}

export function receiveChangeMapSharing(mapId: number, shared: number) {
    return {
        type: CHANGE_MAP_SHARING,
        mapId,
        shared,
    }
}

export function requestDataInfo() {
    return {
        type: REQUEST_DATA_INFO
    }
}

export function receiveDataInfo(json: any) {
    return {
        type: RECEIVE_DATA_INFO,
        json
    }
}

export function receiveColourInfo(json: any) {
    return {
        type: RECEIVE_COLOUR_INFO,
        json
    }
}

export function requestColourInfo() {
    return {
        type: REQUEST_COLOUR_INFO
    }
}

export function receieveUpdatedMap(map: object) {
    return {
        type: RECEIVE_UPDATED_MAP,
        map
    }
}

export function receieveUpdatedLayer(mapId: number, layerId: number, layer: object) {
    return {
        type: RECEIVE_UPDATED_LAYER,
        mapId,
        layerId,
        layer,
    }
}

export function receiveDeleteMapLayer(mapId: number, layerId: number) {
    return {
        type: RECEIVE_DELETE_MAP_LAYER,
        mapId,
        layerId
    }
}

export function receiveCloneMapLayer(mapId: number, layerId: number) {
    return {
        type: RECEIVE_CLONE_MAP_LAYER,
        mapId,
        layerId
    }
}

export function receiveAppLoaded() {
    return {
        type: RECEIVE_APP_LOADED,
    }
}

export function receiveSidebarState() {
    return {
        type: RECEIVE_TOGGLE_SIDEBAR_STATE,
    }
}

export function receiveIterateSnackbar() {
    return {
        type: RECEIVE_ITERATE_SNACKBAR,
    }
}

export function receiveStartSnackbarIfNeeded() {
    return {
        type: RECEIVE_START_SNACKBAR_IF_NEEDED,
    }
}

export function receiveNewSnackbarMessage(message: object) {
    return {
        type: RECEIVE_NEW_SNACKBAR_MESSAGE,
        message
    }
}

export function handleIterateSnackbar() {
    return (dispatch: any) => {
        return dispatch(receiveIterateSnackbar())
    }
}

export function addNewSnackbarMessageAndStartIfNeeded(message: object) {
    return (dispatch: any) => {
        dispatch(receiveNewSnackbarMessage(message))
        return dispatch(receiveStartSnackbarIfNeeded())
    }
}

export function sendSnackbarNotification(message: string) {
    return (dispatch: any) => {
        return dispatch(addNewSnackbarMessageAndStartIfNeeded({
            message: message,
            autoHideDuration: 2500,
        }))
    }
}

export function receiveMapPosition(position: any) {
    return {
        type: RECEIVE_MAP_POSITION,
        position
    }
}

export function setMapOrigin(mapId: number, position: any) {
    return {
        type: RECEIVE_SET_MAP_ORIGIN,
        mapId,
        position,
    }
}

export function setMapPositionToDefault(mapDefaults: any) {
    return {
        type: RECEIVE_RESET_MAP_POSITION,
        mapDefaults,
    }
}

export function toggleAllowMapViewSetting() {
    return {
        type: RECEIVE_TOGGLE_MAP_VIEW_SETTING
    }
}

export function receiveToggleModalState(modalId: string) {
    return {
        type: RECEIVE_TOGGLE_MODAL_STATE,
        modalId,
    }
}

export function toggleModalState(modalId: string) {
    return (dispatch: any) => {
        dispatch(receiveToggleModalState(modalId))
    }
}

export function receiveBeginFetch() {
    return {
        type: RECEIVE_REQUEST_BEGIN_FETCH
    }
}

export function receiveFinishFetch() {
    return {
        type: RECEIVE_REQUEST_FINISH_FETCH
    }
}


export function updateMap(map: object) {
    return (dispatch: any) => {
        return ealapi.put('/api/0.1/maps/' + map["id"] + "/", map, dispatch)
            .then(({ response, json }: any) => {
                // FIXME Cleanup and decide how to handle error at a component and application-level
                
                if(response.status === 200) {
                    // dispatch(receieveUpdatedMap(json))
                    
                } else if(response.status === 400) {
                    // We expect that the server will return the shape:
                    // {
                    //   username: 'User does not exist',
                    //   password: 'Wrong password',
                    //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
                    // }
                    throw new SubmissionError({...json, _error: json.non_field_errors || null})

                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error('Unhandled error creating map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                }
            });
    }
}

export function addLayer(mapId: number) {
    return (dispatch: any, getState: Function) => {
        // Default to 2011 SA4s or whatever the first geometry is
        // FIXME Have schemas nominate their default geometry and set that here or in Python-land in /addLayer
        const datainfo = getState().datainfo
        let defaultGeometry: object = undefined

        if(datainfo["aus_census_2011.sa4_2011_aust_pow"] !== undefined) {
            defaultGeometry = datainfo["aus_census_2011.sa4_2011_aust_pow"]
        } else {
            defaultGeometry = datainfo(Object.keys(datainfo)[0])
        }

        const payload = {
            "layer": {
                "fill": {
                    "opacity": 0.5,
                    "scale_max": 100,
                    "scale_min": 0,
                    "expression": "",
                    "scale_flip": false,
                    "scale_name": "Huey",
                    "conditional": "",
                    "scale_nlevels": 6,
                },
                "line": {
                    "width": 1,
                    "colour": {
                        r: '51',
                        g: '105',
                        b: '30',
                        a: '1',
                    },
                },
                "name": "Unnamed Layer",
                "type": defaultGeometry["geometry_type"],
                "schema": defaultGeometry["schema_name"],
                "visible": true,
                "geometry": defaultGeometry["name"],
                "description": "",
            }
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/addLayer/`, payload, dispatch)
            .then(({ response, json }: any) => {
                if(response.status === 201) {
                    dispatch(receieveUpdatedLayer(mapId, json.layerId, json.layer))
                    dispatch(sendSnackbarNotification(`Layer created successfully`))
                    browserHistory.push(getMapURL(getState().maps[mapId]) + `/layer/${json.layerId}/`)
                }
            })
    }
}

export function updateLayer(mapId: number, layerId: number, layer: object) {
    return (dispatch: any, getState: Function) => {
        const payload = {
            "layerId": layerId,
            "layer": JSON.parse(JSON.stringify(layer)),
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/publishLayer/`, payload, dispatch)
    }
}

export function receiveLayerFormErrors(errors: object) {
    return {
        type: RECEIVE_LAYERFORM_ERRORS,
        errors,
    }
}

export function editDraftLayer(mapId: number, layerId: number, layerPartial: object) {
    return (dispatch: any) => {
        const payload = {
            "layerId": layerId,
            "layer": layerPartial,
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/editDraftLayer/`, payload, dispatch)
            .then(({ response, json }: any) => {
                if(response.status === 200) {
                    dispatch(receieveUpdatedLayer(mapId, layerId, json))
                    return json
                    
                } else if(response.status === 400) {
                    dispatch(receiveLayerFormErrors(json))

                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error('Unhandled error creating map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                }
            });
    }
}

export function publishLayer(mapId: number, layerId: number, layer: object) {
    return (dispatch: any, getState: Function) => {
        dispatch(toggleLayerFormSubmitting())

        return dispatch(updateLayer(mapId, layerId, layer)).then(({ response, json }: any) => {
            if(response.status === 200) {
                dispatch(toggleLayerFormSubmitting())
                dispatch(receieveUpdatedLayer(mapId, layerId, json))
                dispatch(sendSnackbarNotification(`Layer saved successfully`))
                browserHistory.push(getMapURL(getState().maps[mapId]))
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
    return (dispatch: any) => {
        dispatch(toggleLayerFormSubmitting())

        const payload = {
            "layerId": layerId,
        }

        return ealapi.put(`/api/0.1/maps/${mapId}/restoreMasterLayer/`, payload, dispatch)
            .then(({ response, json }: any) => {
                if(response.status === 200) {
                    dispatch(toggleLayerFormSubmitting())
                    dispatch(receieveUpdatedLayer(mapId, layerId, json))
                    // dispatch(sendSnackbarNotification(`Layer restored successfully`))
                    // browserHistory.push(`/map/${mapId}`)
                    return json
                }
            });
    }
}

export function restoreMasterLayerAndDiscardForm(mapId: number, layerId: number) {
    return (dispatch: any, getState: Function) => {
        return dispatch(restoreMasterLayer(mapId, layerId)).then(() => {
            browserHistory.push(getMapURL(getState().maps[mapId]))
        })
    }
}

export function cloneMapLayer(mapId: number, layerId: number) {
    return (dispatch: any, getState: Function) => {
        dispatch(receiveCloneMapLayer(mapId, layerId))
        dispatch(updateMap(getState().maps[mapId]))
        dispatch(sendSnackbarNotification("Layer cloned successfully"))
    }
}

export function deleteMapLayer(map: object, layerId: number) {
    return (dispatch: any) => {
        let mapCopy: object = JSON.parse(JSON.stringify(map))
        if(mapCopy["json"]["layers"][layerId] !== undefined) {
            mapCopy["json"]["layers"].splice(layerId, 1);
        }

        return ealapi.put('/api/0.1/maps/' + mapCopy["id"] + "/", mapCopy, dispatch)
            .then(({ response, json }: any) => {
                // FIXME Cleanup and decide how to handle error at a component and application-level
                if(response.status === 200) {
                    dispatch(receiveDeleteMapLayer(map.id, layerId))
                    // browserHistory.push("/map/" + json.id)
                    
                } else if(response.status === 400) {
                    // We expect that the server will return the shape:
                    // {
                    //   username: 'User does not exist',
                    //   password: 'Wrong password',
                    //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
                    // }
                    throw new SubmissionError({...json, _error: json.non_field_errors || null})

                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error('Unhandled error creating map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                }
            });
    }
}

export function fetchCompiledLayerStyle(mapId: number, layerId: number, layer: Object) {
    return (dispatch: any) => {
        let do_fill = (layer['fill']['expression'] != '')
        if(do_fill) {
            const params = {
                "opacity": layer['fill'].opacity,
                "scale_max": layer['fill'].scale_max,
                "scale_min": layer['fill'].scale_min,
                "expression": layer['fill'].expression,
                "scale_flip": layer['fill'].scale_flip,
                "scale_name": layer['fill'].scale_name,
                "scale_nlevels": layer['fill'].scale_nlevels,
            }

            return ealapi.get("/api/0.1/maps/compileStyle/", dispatch, params)
                .then(({ response, json }: any) => {
                    layer.olStyleDef = json
                    layer.olStyle = compileLayerStyle(layer, false)
                })
                // Wrap layer.olStyle in a function because dotProp automatically executes functions
                .then((json: any) => dispatch(receiveCompiledLayerStyle(mapId, layerId, () => layer.olStyle)))
        }
    }
}

export function updateMapOrigin(map: object, position: any) {
    return (dispatch: any, getState: Function) => {
        dispatch(setMapOrigin(map.id, position))
        dispatch(updateMap(getState().maps[map.id])) // FIXME This *can't* be best practice
        dispatch(sendSnackbarNotification("Map starting position updated successfully"))
    }
}

export function resetMapPosition(mapDefaults: any) {
    return (dispatch: any) => {
        dispatch(toggleAllowMapViewSetting())
        dispatch(setMapPositionToDefault(mapDefaults))

        // FIXME Bit of a hack to temporarily allow the view to update its props
        setTimeout(() => {
            dispatch(toggleAllowMapViewSetting())
        }, 250)
    }
}

export function fetchUserMapsDataAndColourInfo() {
    // https://github.com/reactjs/redux/issues/1676
    // Again, Redux Thunk will inject dispatch here.
    // It also injects a second argument called getState() that lets us read the current state.
    return (dispatch: any, getState: Function) => {
        // Remember I told you dispatch() can now handle thunks?
        return dispatch(fetchUser()).then((user: object) => {
            if(user.id !== null) {
                // And we can dispatch() another thunk now!
                return dispatch(fetchMaps()).then(() => {
                    return dispatch(fetchDataInfo()).then(() => {
                        return dispatch(fetchColourInfo()).then(() => {
                            dispatch(receiveAppLoaded())
                        })
                    })
                })
            } else {
                dispatch(receiveAppLoaded())
            }
        })
    }
}

export function fetchUser() {
    return (dispatch: any) => {
        dispatch(requestUser())

        return ealapi.get('/api/0.1/self', dispatch)
            .then(({ response, json }: any) => {
                dispatch(receiveUser(json))
                return json
            });
    }
}

export function logoutUser() {
    return (dispatch: any) => {
        return ealapi.get('/api/0.1/logout', dispatch)
            .then(({ response, json}: any) => {
                window.location.reload()
            })
    }
}

export function fetchMaps() {
    return (dispatch: any) => {
        dispatch(requestMaps())

        return ealapi.get('/api/0.1/maps/all/', dispatch)
            .then(({ response, json }: any) => {
                // FIXME Cleanup and decide how to handle error at a component and application-level
                if(response.status === 200) {
                    if (json.length > 0) {
                        // Map maps from an array of objects to a dict keyed by mapId
                        const maps = Object.assign(...json.map(d => ({[d.id: d})))
                        dispatch(receiveMaps(maps))
                    }
                }
                // throw new Error(`Error ${response.status}: Failed to retrieve maps.`)
                // return json
            })
    }
}

export function mapUpsert(map: object) {
    return (dispatch: any, getState: Function) => {
        // Upsert
        if(map.id === undefined) {
            return dispatch(createMap(map))
        }
        let mapCopy: object = JSON.parse(JSON.stringify(map))

        return ealapi.put('/api/0.1/maps/' + mapCopy["id"] + "/", mapCopy, dispatch)
            .then(({ response, json }: any) => {
                // FIXME Cleanup and decide how to handle error at a component and application-level
                // throw new Error('Unhandled error updating map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                
                if(response.status === 200) {
                    dispatch(receieveUpdatedMap(json))
                    browserHistory.push(getMapURL(json))
                    dispatch(sendSnackbarNotification("Map saved successfully"))
                    
                } else if(response.status === 400) {
                    // We expect that the server will return the shape:
                    // {
                    //   username: 'User does not exist',
                    //   password: 'Wrong password',
                    //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
                    // }
                    throw new SubmissionError({...json, _error: json.non_field_errors || null})

                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error('Unhandled error updating map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                }
            });
    }
}

export function createMap(map: object) {
    return (dispatch: any) => {
        let mapCopy: object = JSON.parse(JSON.stringify(map))
        mapCopy["json"] = {
            // FIXME
            "map_defaults": {
                "lat": "-27.121915157767",
                "lon": "133.21253738715",
                "zoom": "4"
            },
            "layers": [],
        }

        return ealapi.post('/api/0.1/maps/', mapCopy, dispatch)
            .then(({ response, json }: any) => {
                // FIXME Cleanup and decide how to handle error at a component and application-level
                // throw new Error('Unhandled error creating map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                
                if(response.status === 201) {
                    dispatch(receiveCreatedMap(json))
                    browserHistory.push(getMapURL(json))
                    
                } else if(response.status === 400) {
                    // We expect that the server will return the shape:
                    // {
                    //   username: 'User does not exist',
                    //   password: 'Wrong password',
                    //   non_field_errors: 'Some sort of validation error not relevant to a specific field'
                    // }
                    throw new SubmissionError({...json, _error: json.non_field_errors || null})

                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error('Unhandled error creating map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                }
            })
            .catch((error: any) => {
                if(error instanceof SubmissionError) {
                    throw error;
                } else {
                    throw new SubmissionError({_error: error.message});
                }
            });
    }
}

export function duplicateMap(mapId: number) {
    return (dispatch: any) => {
        return ealapi.put('/api/0.1/maps/' + encodeURIComponent(mapId.toString()) + '/clone/', null, dispatch)
            .then(({ response, json }: any) => {
                if(response.status === 201) {
                    dispatch(receiveCreatedMap(json))
                    dispatch(sendSnackbarNotification("Map duplicated successfully"))
                    browserHistory.push(getMapURL(json))
                    
                } else {
                    // We're not sure what happened, but handle it:
                    // our Error will get passed straight to `.catch()`
                    throw new Error('Unhandled error cloning map. Please report. (' + response.status + ') ' + JSON.stringify(json));
                }
            })
    }
}

/*
So, there seems to be two approaches to handling the "How do I do some action on the site (like using React-Router to change pages)?" question.

1. Pass a callback function in and call that from the action.

2. Call react-router directly from the action.

Some further reading on the subject:

- https://github.com/reactjs/redux/issues/291
- http://stackoverflow.com/questions/36886506/redux-change-url-when-an-async-action-is-dispatched
*/
export function deleteMapSuccess(mapId: number) {
  return (dispatch: any) => {
    dispatch(receiveDeleteMap(mapId))
    dispatch(sendSnackbarNotification("Map deleted successfully"))
    browserHistory.push("/");
  };
}

export function deleteMap(mapId: number) {
    return (dispatch: any) => {
        return ealapi.delete('/api/0.1/maps/' + encodeURIComponent(mapId.toString()) + '/', dispatch)
            .then((response: any) => {
                if(response.status == 204) {
                    dispatch(deleteMapSuccess(mapId))
                } else {
                    var error = new Error(response.statusText)
                    error.response = response
                    // dispatch(deleteMapError(error));
                    throw error
                }
            });
    }
}

export function fetchDataInfo() {
    return (dispatch: any) => {
        dispatch(requestDataInfo())

        return ealapi.get('/api/0.1/datainfo/', dispatch)
            .then(({ response, json }: any) => {
                const ordered = {};
                Object.keys(json).sort().forEach(function(key) {
                    ordered[key] = json[key];
                });
                
                dispatch(receiveDataInfo(ordered))
            });
    }
}

export function fetchColourInfo() {
    return (dispatch: any) => {
        dispatch(requestColourInfo())

        return ealapi.get('/api/0.1/colours/', dispatch)
            .then(({ response, json }: any) => {
                dispatch(receiveColourInfo(json))
            });
    }
}

export function updateDataInspector(dataRows: Array<any>) {
    return {
        type: RECEIVE_UPDATE_DATA_INSPECTOR,
        dataRows,
    }
}

export function resetDataInspector() {
    return {
        type: RECEIVE_RESET_DATA_INSPECTOR
    }
}

export function sendToDataInspector(mapId: number, features: Array<undefined>) {
    return (dispatch: any, getState: Function) => {
        features.forEach((feature: any) => {
            const featureProps = feature.featureProps
            const map = getState().maps[feature.mapId]
            const layer = map.json.layers[feature.layerId]

            ealapi.get(`/api/0.1/datainfo/${layer.geometry}/?schema=${layer.schema}&gid=${featureProps.gid}`, dispatch)
                .then(({ response, json }: any) => {
                    let dataRowProps: Array<any> = [{
                        "name": "Value",
                        "value": featureProps.q,
                    }]

                    for(let key in json) {
                        if(key !== "gid") {
                            dataRowProps.push({
                                "name": key,
                                "value": json[key]
                            })
                        }
                    }
                    
                    dispatch(updateDataInspector([{
                        "name": `Layer ${layer.name}`,
                        "properties": dataRowProps,
                    }]))

                    browserHistory.push(getMapURL(getState().maps[mapId]) + '/data')
                })
        })
    }
}

export function toggleDebugMode() {
    return {
        type: RECEIVE_TOGGLE_DEBUG_MODE
    }
}

export function receiveTableInfo(json: any) {
    return {
        type: RECEIVE_TABLE_INFO,
        json
    }
}

export function updateDataDiscovery(dataColumns: object) {
    return {
        type: RECEIVE_UPDATE_DATA_DISCOVERY,
        dataColumns,
    }
}

export function setLayerFormChipValues(chipValues: Array<string>) {
    return {
        type: RECEIVE_CHIP_VALUES,
        chipValues,
    }
}

export function toggleLayerFormSubmitting() {
    return {
        type: RECEIVE_TOGGLE_LAYERFORM_SUBMITTING,
    }
}

export function resetDataDiscovery() {
    return {
        type: RECEIVE_RESET_DATA_DISCOVERY
    }
}

export function processResponseForDataDiscovery(response: object, json: object, dispatch: Function) {
    if(response.status === 404) {
        dispatch(sendSnackbarNotification("No columns found matching your search criteria."))
        return
    }

    dispatch(receiveTableInfo(json["tables"]))

    let columnsByTable = {}
    for(let key in json["columns"]) {
        const col = json["columns"][key]
        if(columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]] === undefined) {
            columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]] = {
                "table": json["tables"][col["tableinfo_id"]],
                "columns": []
            }
        }
        columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]].columns.push(col)
    }
    dispatch(updateDataDiscovery(columnsByTable))
}

export function getColumnsForGeometry(chips: Array<string>, geometry: object) {
    return (dispatch: any) => {
        const params = {
            "search": chips.join(","),
            "schema": geometry["schema_name"],
            "geo_source_id": geometry["_id"],
        }
        return ealapi.get('/api/0.1/columninfo/search/', dispatch, params)
    }
}

export function fetchColumnsForGeometry(chips: Array<string>, geometry: object) {
    return (dispatch: any, getState: Function) => {
        dispatch(resetDataDiscovery())

        return dispatch(getColumnsForGeometry(chips, geometry)).then(({ response, json }) => {
            processResponseForDataDiscovery(response, json, dispatch)
        })
    }
}

export function getColumnsForTable(chips: Array<string>, geometry: object, table_names: Array<string>) {
    return (dispatch: any) => {
        const params = {
            "search": chips.join(","),
            "schema": geometry["schema_name"],
            "tableinfo_name": table_names.join(","),
        }
        return ealapi.get('/api/0.1/columninfo/search/', dispatch, params)
    }
}

export function fetchColumnsForTable(chips: Array<string>, geometry: object, table_names: Array<string>) {
    return (dispatch: any, getState: Function) => {
        dispatch(resetDataDiscovery())

        return dispatch(getColumnsForTable(chips, geometry, table_names)).then(({ response, json }) => {
            processResponseForDataDiscovery(response, json, dispatch)
        })
    }
}

export function getColumnsByName(chips: Array<string>, geometry: object) {
    return (dispatch: any) => {
        const params = {
            "name": chips.join(","),
            "schema": geometry["schema_name"],
            "geo_source_id": geometry["_id"]
        }
        return ealapi.get('/api/0.1/columninfo/by_name/', dispatch, params)
    }
}

export function fetchColumnsByName(chips: Array<string>, geometry: object) {
    return (dispatch: any, getState: Function) => {
        dispatch(resetDataDiscovery())

        return dispatch(getColumnsByName(chips, geometry)).then(({ response, json }) => {
            processResponseForDataDiscovery(response, json, dispatch)
        })
    }
}

export function receiveAppPreviousPath(previousPath: string) {
    return {
        type: RECEIVE_APP_PREVIOUS_PATH,
        previousPath,
    }
}

export function receiveChangeLayerProperty(mapId: number, layerId: number, layerPropertyPath: string, layerPropertyValue: any) {
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

export function initDraftLayer(mapId: number, layerId: number) {
    return (dispatch: any) => {
        const payload = {"layerId": layerId}
        return ealapi.put(`/api/0.1/maps/${mapId}/initDraftLayer/`, payload, dispatch)
    }
}

export function handleLayerFormChange(layerPartial: object, mapId: number, layerId: number) {
    return (dispatch: any, getState: Function) => {
        // Determine if we need to recompile the layer server-side.
        // e.g. Recompile the SQL expression, recompile the layer styles, et cetera
        let willCompileServerSide: boolean = false
        if("geometry" in layerPartial) {
            willCompileServerSide = true
        }
        if(!willCompileServerSide && "fill" in layerPartial) {
            willCompileServerSide = Object.keys(layerPartial["fill"]).some((value: string, index: number, array: Array<string>) => {
                return ["scale_min", "scale_max", "expression", "conditional", "scale_flip", "scale_name", "scale_nlevels"].indexOf(value) >= 0
            })
        }

        // Where possible, simply merge our partial layer object into the Redux store.
        if(!willCompileServerSide) {
            return dispatch(receiveMergeLayerProperties(mapId, layerId, layerPartial))

        } else {
            return dispatch(editDraftLayer(mapId, layerId, layerPartial)).then((layer: object) => {
                if(typeof layer === "object") {
                    // Refresh layer query summary if any of the core fields change (i.e. Fields that change the PostGIS query)
                    let haveCoreFieldsChanged: boolean = false
                    if("fill" in layerPartial) {
                        haveCoreFieldsChanged = Object.keys(layerPartial["fill"]).some((value: string, index: number, array: Array<string>) => {
                                return ["scale_min", "scale_max", "expression", "conditional"].indexOf(value) >= 0
                        })
                    }

                    if(haveCoreFieldsChanged || "geometry" in layerPartial) {
                        dispatch(fetchLayerQuerySummary(mapId, layer.hash))
                    }
                }
            })
        }
    }
}

export function fetchLayerQuerySummary(mapId: number, layerHash: string) {
    return (dispatch: any) => {
        const payload = {"layer": layerHash}
        return ealapi.get(`/api/0.1/maps/${mapId}/query_summary/`, dispatch, payload)
            .then(({ response, json }: any) => {
                dispatch(receiveLayerQuerySummary(json, layerHash))
            });
    }
}

export function receiveLayerQuerySummary(stats: object, layerHash: string) {
    return {
        type: RECEIVE_LAYER_QUERY_SUMMARY,
        stats,
        layerHash,
    }
}

export function receiveLegendPeekLabel(mapId: number, layerId: number, labelText: string) {
    return {
        type: RECEIVE_LEGENDPEEK_LABEL,
        mapId,
        layerId,
        labelText,
    }
}

export function changeMapSharing(mapId: number, shared: number) {
    return (dispatch: any, getState: Function) => {
        dispatch(receiveChangeMapSharing(mapId, shared))
        dispatch(updateMap(getState().maps[mapId])).then(() => {
            dispatch(sendSnackbarNotification("Layer sharing settings updated"))
        })
    }
}

export function setUserMenuState(open: boolean) {
    return {
        type: RECEIVE_SET_USER_MENU_STATE,
        open,
    }
}