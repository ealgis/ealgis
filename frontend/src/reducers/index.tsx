import { combineReducers, Reducer } from 'redux';
import { REQUEST_USER, RECEIVE_USER, REQUEST_MAPS, RECEIVE_MAPS } from '../actions'

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

function maps(state = [], action: any) {
    switch (action.type) {
        case REQUEST_MAPS:
            return state
        case RECEIVE_MAPS:
            return action.json
        default:
            return state
    }
}

export default {
    user,
    maps
};