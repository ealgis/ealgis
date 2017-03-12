import { combineReducers, Reducer } from 'redux';
import { REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS, REQUEST_MAP_DEFINITION, RECEIVE_MAP_DEFINITION, CREATE_MAP, DELETE_MAP, COMPILED_LAYER_STYLE, CHANGE_LAYER_VISIBILITY, CHANGE_FORM_MODEL } from '../actions'

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
            return Object.assign(...action.json.map(d => ({[d.id: d})))
            // return new Map(action.json.map((i: any) => [i.id, i]))
        case CREATE_MAP:
            return {
                ...state,
                [action.map.id]: action.map
            }
        case DELETE_MAP:
            let { [action.mapId]: deletedItem, ...rest } = state
            return rest
        case CHANGE_LAYER_VISIBILITY:
            // FIXME Layers should be an array, not an object
            let layerId: number?: null
            for (let l in state[action.mapId].json.layers) {
                if(state[action.mapId].json.layers[l].hash === action.layerHash) {
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
            // Ideas for a better approach -> http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html
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
                                visible: !state[action.mapId].json.layers[layerId].visible,
                            }
                        }
                    }
                }
            }
        case COMPILED_LAYER_STYLE:
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

export default {
    user,
    maps,
};