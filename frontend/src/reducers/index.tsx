import { combineReducers } from 'redux';
import { REQUEST_USER, RECEIVE_USER } from '../actions'

function user(state = {
    user: {}
}, action: any) {
    switch (action.type) {
        case REQUEST_USER:
            return state;
        case RECEIVE_USER:
            return {
                ...state,
                user: action.user
            }
        default:
            return state
    }
}

const ealApp = combineReducers ({
    user
});

export default ealApp;