import { combineReducers, Reducer } from 'redux';
import * as dotProp from 'dot-prop-immutable';
import { RECEIVE_APP_LOADED, RECEIVE_TOGGLE_SIDEBAR_STATE, RECEIVE_NEW_SNACKBAR_MESSAGE,RECEIVE_START_SNACKBAR_IF_NEEDED, RECEIVE_ITERATE_SNACKBAR, RECEIVE_TOGGLE_MODAL, REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS, REQUEST_MAP_DEFINITION, RECEIVE_MAP_DEFINITION, CREATE_MAP, DELETE_MAP, COMPILED_LAYER_STYLE, CHANGE_LAYER_VISIBILITY, REQUEST_DATA_INFO, RECEIVE_DATA_INFO, REQUEST_COLOUR_INFO, RECEIVE_COLOUR_INFO, RECEIVE_UPDATED_MAP, RECEIVE_DELETE_MAP_LAYER } from '../actions';

function app(state = {
    loading: true,
    sidebarOpen: true,
    snackbar: {
        open: false,
        active: {
            message: ""
        },
        messages: [],
    },
    dialogs: {}
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
        case RECEIVE_TOGGLE_MODAL:
            console.log("RECEIVE_TOGGLE_MODAL", action.modalId)
            return dotProp.toggle(state, `dialogs.${action.modalId}`)
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
            console.log("COMPILED_LAYER_STYLE", action)
            console.log("action.layer.line.width", action.layer.line.width)
            // const newLayer = dotProp.merge(`${action.mapId}.json.layers.${action.layerId}`, ``, action.layer)
            // console.log(newLayer)
            console.log(action.layer.line.width, "action.layer.line.width")
            return dotProp.set(state, `${action.mapId}.json.layers.${action.layerId}`, action.layer)
            return state

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