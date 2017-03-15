import { combineReducers, Reducer } from 'redux';
import * as dotProp from 'dot-prop-immutable';
import { REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS, REQUEST_MAP_DEFINITION, RECEIVE_MAP_DEFINITION, CREATE_MAP, DELETE_MAP, COMPILED_LAYER_STYLE, CHANGE_LAYER_VISIBILITY, RECEIVE_DATA_INFO, RECEIVE_COLOUR_INFO } from '../actions';

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
            // Map our array into an object where mapIds are the key
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
            // FIXME This fails (layerHash as gid) if we have two layers with the same geom and expression
            let layerKey: number?: null
            let layer: object
            for (let l in state[action.mapId].json.layers) {
                if(state[action.mapId].json.layers[l].hash === action.layerHash) {
                    layerKey = l
                    layer = state[action.mapId].json.layers[l]
                    break
                }
            }

            if(layerKey === null) {
                return state
            }

            // https://github.com/reactjs/redux/issues/57#issuecomment-109764580
            // http://redux.js.org/docs/Troubleshooting.html#nothing-happens-when-i-dispatch-an-action
            // http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html#updating-nested-objects
            // Ideas for a better approach -> http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html
            return dotProp.set(state, `${action.mapId}.json.layers.${layerKey}.visible`, !layer.visible)
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
    user,
    maps,
    datainfo,
    colourinfo,
};