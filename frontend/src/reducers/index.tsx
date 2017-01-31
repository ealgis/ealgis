import { combineReducers, Reducer } from 'redux';
import { REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS, REQUEST_MAP_DEFINITION, RECEIVE_MAP_DEFINITION } from '../actions'

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
        default:
            return state
    }
}

export default {
    user,
    maps,
    map_definition
};