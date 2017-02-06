import { combineReducers, Reducer } from 'redux';
import { REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS, REQUEST_MAP_DEFINITION, RECEIVE_MAP_DEFINITION, CLOSE_MAP, COMPILED_LAYER_STYLE, CHANGE_LAYER_VISIBILITY } from '../actions'

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

function maps(state: any[] = [], action: any) {
    switch (action.type) {
        case REQUEST_MAPS:
            return state
        case RECEIVE_MAPS:
            return action.json
        default:
            return state
    }
}

function map_definition(state = {}, action: any) {
    switch (action.type) {
        case REQUEST_MAP_DEFINITION:
            return state
        case RECEIVE_MAP_DEFINITION:
            return action.json
        case CLOSE_MAP:
            return {}
        case CHANGE_LAYER_VISIBILITY:
            // FIXME Layers should be an array, not an object
            let layerId: number?: null
            for (let l in state.json.layers) {
                if(state.json.layers[l].hash === action.layerHash) {
                    layerId = l
                    break
                }
            }

            if(layerId === null) {
                return state
            }

            // https://github.com/reactjs/redux/issues/57#issuecomment-109764580
            // http://redux.js.org/docs/Troubleshooting.html#nothing-happens-when-i-dispatch-an-action
            // http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html#updating-nested-objects
            return {
                ...state,
                json: {
                    ...state.json,
                    layers: {
                        ...state.json.layers,
                        [layerId]: {
                            ...state.json.layers[layerId],
                            visible: !state.json.layers[layerId].visible,
                        }
                    }
                }
            }
        case COMPILED_LAYER_STYLE:
            return {
                ...state,
                json: {
                    ...state.json,
                    layers: {
                        ...state.json.layers,
                        [layerId]: {
                            ...state.json.layers[layerId],
                            olStyle: action.json,
                        }
                    }
                }
            }
        default:
            return state
    }
}

export default {
    user,
    maps,
    map_definition
};