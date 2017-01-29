import Promise from 'promise-polyfill'
import 'whatwg-fetch'

export const REQUEST_USER = 'REQUEST USER'
export const RECEIVE_USER = 'RECEIVE_USER'
export const REQUEST_MAPS = 'REQUEST MAPS'
export const RECEIVE_MAPS = 'RECEIVE_MAPS'

export function requestUser() {
    return {
        type: REQUEST_USER
    }
}

export function receiveUser(json: any) {
    return {
        type: RECEIVE_USER,
        json
    }
}

export function requestMaps() {
    return {
        type: REQUEST_MAPS
    }
}

export function receiveMaps(json: any) {
    return {
        type: RECEIVE_MAPS,
        json
    }
}

export function fetchUser() {
    return (dispatch: any) => {
        dispatch(requestUser())
        return fetch('http://localhost:8000/api/0.1/self', {
            credentials: 'same-origin'
        })
            .then((response: any) => response.json())
            .then((json: any) => dispatch(receiveUser(json)))
    }
}

export function fetchMaps() {
    return (dispatch: any) => {
        dispatch(requestMaps())
        return fetch('http://localhost:8000/api/0.1/maps/', {
            credentials: 'same-origin'
        })
            .then((response: any) => response.json())
            .then((json: any) => dispatch(receiveMaps(json)))
    }
}