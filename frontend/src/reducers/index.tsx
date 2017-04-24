import { combineReducers, Reducer } from 'redux';
import * as dotProp from 'dot-prop-immutable';
import { RECEIVE_APP_LOADED, RECEIVE_TOGGLE_SIDEBAR_STATE, RECEIVE_NEW_SNACKBAR_MESSAGE,RECEIVE_START_SNACKBAR_IF_NEEDED, RECEIVE_ITERATE_SNACKBAR, RECEIVE_MAP_POSITION, RECEIVE_SET_MAP_ORIGIN, RECEIVE_RESET_MAP_POSITION, RECEIVE_TOGGLE_MAP_VIEW_SETTING, REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS, REQUEST_MAP_DEFINITION, RECEIVE_MAP_DEFINITION, CREATE_MAP, DELETE_MAP, COMPILED_LAYER_STYLE, CHANGE_LAYER_VISIBILITY, REQUEST_DATA_INFO, RECEIVE_DATA_INFO, REQUEST_COLOUR_INFO, RECEIVE_COLOUR_INFO, RECEIVE_UPDATED_MAP, RECEIVE_DELETE_MAP_LAYER, RECEIVE_CLONE_MAP_LAYER, RECEIVE_TOGGLE_MODAL_STATE, RECEIVE_UPDATE_DATA_INSPECTOR, RECEIVE_RESET_DATA_INSPECTOR, RECEIVE_TOGGLE_DEBUG_MODE, RECEIVE_REQUEST_BEGIN_FETCH, RECEIVE_REQUEST_FINISH_FETCH, RECEIVE_UPDATE_DATA_DISCOVERY, RECEIVE_RESET_DATA_DISCOVERY, RECEIVE_TABLE_INFO, RECEIVE_CHIP_VALUES, RECEIVE_UPDATE_LAYER_FORM_GEOMETRY } from '../actions';

function app(state = {
    loading: true,
    requestsInProgress: 0,
    sidebarOpen: true,
    debug: false,
    snackbar: {
        open: false,
        active: {
            message: ""
        },
        messages: [],
    },
    dialogs: {},
    mapPosition: {},
    allowMapViewSetting: false,
    dataInspector: [],
    dataDiscovery: [],
    layerForm: {
        chipValues: [],
        geometry: null,
    },
}, action: any) {
    switch (action.type) {
        case RECEIVE_REQUEST_BEGIN_FETCH:
            return dotProp.set(state, "requestsInProgress", ++state.requestsInProgress)
        case RECEIVE_REQUEST_FINISH_FETCH:
            return dotProp.set(state, "requestsInProgress", --state.requestsInProgress)
        case REQUEST_USER:
        case REQUEST_MAPS:
        case REQUEST_DATA_INFO:
        case REQUEST_COLOUR_INFO:
            return dotProp.set(state, "loading", true)
        case RECEIVE_APP_LOADED:
            return dotProp.set(state, "loading", false)
        case RECEIVE_TOGGLE_SIDEBAR_STATE:
            return dotProp.toggle(state, "sidebarOpen")
        case RECEIVE_TOGGLE_DEBUG_MODE:
            return dotProp.toggle(state, "debug")
        case RECEIVE_NEW_SNACKBAR_MESSAGE:
            state.snackbar.messages.push(action.message)
            return dotProp.set(state, `snackbar.messages`, state.snackbar.messages)
        case RECEIVE_START_SNACKBAR_IF_NEEDED:
            if(state.snackbar.open === false && state.snackbar.messages.length > 0) {
                // Pop the first message off the front of the queue
                const message = state.snackbar.messages.shift()
                state = dotProp.set(state, `snackbar.messages`, state.snackbar.messages)
                state = dotProp.set(state, `snackbar.active`, message)
                state = dotProp.set(state, `snackbar.open`, true)
            }
            return state
        case RECEIVE_ITERATE_SNACKBAR:
            if(state.snackbar.messages.length > 0) {
                // Pop the first message off the front of the queue
                const message = state.snackbar.messages.shift()
                state = dotProp.set(state, `snackbar.messages`, state.snackbar.messages)
                state = dotProp.set(state, `snackbar.active`, message)
                return dotProp.set(state, `snackbar.open`, true)
            } else {
                state = dotProp.set(state, `snackbar.active`, {message: ""})
                return dotProp.set(state, `snackbar.open`, false)
            }
        case RECEIVE_MAP_POSITION:
            if("center" in action.position) {
                return dotProp.set(state, `mapPosition.center`, action.position.center)
            } else if("zoom" in action.position) {
                return dotProp.set(state, `mapPosition.zoom`, action.position.zoom)
            }
            return state
        case RECEIVE_RESET_MAP_POSITION:
            return dotProp.set(state, `mapPosition`, {
                "center": {
                    "lon": action.mapDefaults.lon,
                    "lat": action.mapDefaults.lat,
                },
                "zoom": action.mapDefaults.zoom,
            })
        case RECEIVE_TOGGLE_MAP_VIEW_SETTING:
            return dotProp.toggle(state, `allowMapViewSetting`)
        case RECEIVE_TOGGLE_MODAL_STATE:
            return dotProp.toggle(state, `dialogs.${action.modalId}`)
        case RECEIVE_UPDATE_DATA_INSPECTOR:
            return dotProp.set(state, 'dataInspector', [...state.dataInspector, ...action.dataRows])
        case RECEIVE_RESET_DATA_INSPECTOR:
            return dotProp.set(state, 'dataInspector', [])
        case RECEIVE_UPDATE_LAYER_FORM_GEOMETRY:
            return dotProp.set(state, "layerForm.geometry", action.geometry)
        case RECEIVE_UPDATE_DATA_DISCOVERY:
            return dotProp.set(state, 'dataDiscovery', action.dataColumns)
        case RECEIVE_RESET_DATA_DISCOVERY:
            return dotProp.set(state, 'dataDiscovery', [])
        case RECEIVE_CHIP_VALUES:
            return dotProp.set(state, "layerForm.chipValues", action.chipValues)
        default:
            return state;
    }
}

function user(state = {
    user: {
        url: null
    }
}, action: any) {
    switch (action.type) {
        case REQUEST_USER:
            return state;
        case RECEIVE_USER:
            return action.json
        default:
            return state
    }
}

function maps(state: any = {}, action: any) {
    switch (action.type) {
        case REQUEST_MAPS:
            return state
        case RECEIVE_MAPS:
            return action.maps
        case RECEIVE_UPDATED_MAP:
            return dotProp.set(state, `${action.map.id}`, action.map)
        case CREATE_MAP:
            return {
                ...state,
                [action.map.id]: action.map
            }
        case DELETE_MAP:
            let { [action.mapId]: deletedItem, ...rest } = state
            return rest
        case RECEIVE_DELETE_MAP_LAYER:
            return dotProp.delete(state, `${action.mapId}.json.layers.${action.layerId}`)
        case RECEIVE_CLONE_MAP_LAYER:
            let layerCopy = JSON.parse(JSON.stringify(state[action.mapId].json.layers[action.layerId]))
            layerCopy.name += " Copy"
            return dotProp.set(state, `${action.mapId}.json.layers`, [...state[action.mapId].json.layers, layerCopy])
        case CHANGE_LAYER_VISIBILITY:
            return dotProp.toggle(state, `${action.mapId}.json.layers.${action.layerId}.visible`)
        case RECEIVE_SET_MAP_ORIGIN:
            return dotProp.set(state, `${action.mapId}.json.map_defaults`, {
                lat: action.position.center.lat,
                lon: action.position.center.lon,
                zoom: action.position.zoom,
            })
        // case RECEIVE_LAYER_UPSERT:
        //     console.log("RECEIVE_LAYER_UPSERT")
        //     console.log(state)
        //     console.log(action)

            
        //     if(action.layerId === undefined) {
        //         console.log("Adding new layer")
        //         let list = state[action.mapId]["json"]["layers"]
        //         console.log(list)
        //         if(list.length >= 1) {
        //             console.log("Existing layers list")
        //             return dotProp.set(state, '${action.mapId}.json.layers', list => [...list, action.layer])
        //         } else {
        //             console.log("New layers list")
        //             return dotProp.set(state, `${action.mapId}.json.layers`, [action.layer])
        //         }
        //     } else {
        //         console.log("Updating existing layer")
        //         return dotProp.set(state, `${action.mapId}.json.layers.${action.layerId}`, action.layer)
        //     }
        case COMPILED_LAYER_STYLE:
            // FIXME Make this work
            return dotProp.set(state, `${action.mapId}.json.layers.${layerKey}.olStyle`, action.json)

            return {
                ...state,
                [action.mapId]: {
                    ...state[action.mapId],
                    json: {
                        ...state[action.mapId].json,
                        layers: {
                            ...state[action.mapId].json.layers,
                            [layerId]: {
                                ...state[action.mapId].json.layers[layerId],
                                olStyle: action.json,
                            }
                        }
                    }
                }
            }
        default:
            return state
    }
}

function datainfo(state = {}, action: any) {
    switch (action.type) {
        case RECEIVE_DATA_INFO:
            return action.json
        default:
            return state
    }
}

function colourinfo(state = {}, action: any) {
    switch (action.type) {
        case RECEIVE_COLOUR_INFO:
            return action.json
        default:
            return state
    }
}

function tableinfo(state = {}, action: any) {
    switch (action.type) {
        case RECEIVE_TABLE_INFO:
            return Object.assign(state, action.json)
        default:
            return state
    }
}

export default {
    app,
    user,
    maps,
    datainfo,
    colourinfo,
    tableinfo,
};