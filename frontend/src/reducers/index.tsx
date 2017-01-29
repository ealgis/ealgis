import { combineReducers, Reducer } from 'redux';
import { REQUEST_USER, RECEIVE_USER } from '../actions'

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

export default {
    user    
};