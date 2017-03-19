import { combineReducers, Reducer } from 'redux';
import * as dotProp from 'dot-prop-immutable';
import { RECEIVE_APP_LOADED, RECEIVE_TOGGLE_SIDEBAR_STATE, REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS, REQUEST_MAP_DEFINITION, RECEIVE_MAP_DEFINITION, CREATE_MAP, DELETE_MAP, COMPILED_LAYER_STYLE, CHANGE_LAYER_VISIBILITY, REQUEST_DATA_INFO, RECEIVE_DATA_INFO, REQUEST_COLOUR_INFO, RECEIVE_COLOUR_INFO, RECEIVE_UPDATED_MAP, RECEIVE_DELETE_MAP_LAYER } from '../actions';

function app(state = {
    loading: true,
    sidebarOpen: true,
}, action: any) {
    switch (action.type) {
        case REQUEST_USER:
        case REQUEST_MAPS:
        case REQUEST_DATA_INFO:
        case REQUEST_COLOUR_INFO:
            return dotProp.set(state, "loading", true)
        case RECEIVE_APP_LOADED:
            return dotProp.set(state, "loading", false)
        case RECEIVE_TOGGLE_SIDEBAR_STATE:
            return dotProp.toggle(state, "sidebarOpen")
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
        case CHANGE_LAYER_VISIBILITY:
            return dotProp.toggle(state, `${action.mapId}.json.layers.${action.layerId}.visible`)
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

export default {
    app,
    user,
    maps,
    datainfo,
    colourinfo,
};