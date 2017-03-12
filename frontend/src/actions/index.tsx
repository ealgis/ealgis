import Promise from 'promise-polyfill'
import 'whatwg-fetch'
import { browserHistory } from 'react-router';
import cookie from 'react-cookie'
import { compileLayerStyle } from '../utils/OLStyle'

export const REQUEST_USER = 'REQUEST USER'
export const RECEIVE_USER = 'RECEIVE_USER'
export const REQUEST_MAPS = 'REQUEST MAPS'
export const RECEIVE_MAPS = 'RECEIVE_MAPS'
export const REQUEST_MAP_DEFINITION = 'REQUEST_MAP_DEFINITION'
export const RECEIVE_MAP_DEFINITION = 'RECEIVE_MAP_DEFINITION'
export const DELETE_MAP = 'DELETE_MAP'
export const CREATE_MAP = 'CREATE_MAP'
export const COMPILED_LAYER_STYLE = 'COMPILED_LAYER_STYLE'
export const CHANGE_LAYER_VISIBILITY = 'CHANGE_LAYER_VISIBILITY'

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

export function requestMapDefinition() {
    return {
        type: REQUEST_MAP_DEFINITION
    }
}

export function receiveMapDefinition(json: any) {
    return {
        type: RECEIVE_MAP_DEFINITION,
        json
    }
}

export function receiveChangeLayerVisibility(mapId: number, layerHash: string) {
    return {
        type: CHANGE_LAYER_VISIBILITY,
        mapId,
        layerHash,
    }
}

export function changeLayerVisibility(mapId: number, layerHash: string) {
    return (dispatch: any) => {
        dispatch(receiveChangeLayerVisibility(mapId, layerHash))
    }
}

export function receiveDeleteMap(mapId: number) {
    return (dispatch: any) => {
        dispatch({
            type: DELETE_MAP,
            mapId
        })
    }
}

export function receiveCreatedMap(map: object) {
    return (dispatch: any) => {
        dispatch({
            type: CREATE_MAP,
            map
        })
    }
}

export function receiveCompiledLayerStyle(json: any) {
    return {
        type: COMPILED_LAYER_STYLE,
        json
    }
}

export function fetchCompiledLayerStyle(l: Object) {
    return (dispatch: any) => {
        let do_fill = (l['fill']['expression'] != '')
        if(do_fill) {
            // Ugly as sin, but apparently fetch doesn't natively support attaching a params object?!
            // https://github.com/github/fetch/issues/256
            let url = new URL("https://localhost:8443/api/0.1/maps/compileStyle/"), params = {
                "opacity": fill.opacity,
                "scale_max": fill.scale_max,
                "scale_min": fill.scale_min,
                "expression": fill.expression,
                "scale_flip": fill.scale_flip,
                "scale_name": fill.scale_name,
                "scale_nlevels": fill.scale_nlevels,
            }
            Object.keys(params).forEach((key, value) => { url.searchParams.append(key, params[key]) })

            fetch(url, {
                credentials: "same-origin",
            })
                .then((response: any) => response.json())
                .then((json: any) => {
                    l.olStyleDef = json
                    return compileLayerStyle(l)
                })
                .then((json: any) => dispatch(receiveCompiledLayerStyle(json)))
        }
    }
}

export function fetchUser() {
    return (dispatch: any) => {
        dispatch(requestUser())
        return fetch('/api/0.1/self', {
            credentials: "same-origin",
        })
            .then((response: any) => response.json())
            .then((json: any) => dispatch(receiveUser(json)))
    }
}

export function fetchMaps() {
    return (dispatch: any) => {
        dispatch(requestMaps())
        return fetch('/api/0.1/maps/', {
            credentials: "same-origin",
        })
            .then((response: any) => response.json())
            .then((json: any) => dispatch(receiveMaps(json)))
    }
}

export function fetchMapDefinition(mapId: Number) {
    return (dispatch: any) => {
        dispatch(requestMapDefinition())
        return fetch('/api/0.1/maps/' + encodeURIComponent(mapId.toString()) + '/', {
            credentials: "same-origin",
        })
            .then((response: any) => response.json())
            .then((defn: any) => {
                // FIXME Layers should be an array, not an object
                for (let k in defn.json.layers) {
                    const l = defn.json.layers[k]
                    l.olStyle = compileLayerStyle(l)
                }
                return defn
            })
            .then((json: any) => dispatch(receiveMapDefinition(json)))
    }
}

export function createMap(values: any/*, cb: Function*/) {
    return (dispatch: any) => {
        return fetch('/api/0.1/maps/', {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.load("csrftoken")
            },
            body: JSON.stringify(Object.assign(values, {
                "json": {
                    "map_defaults": {
                        "lat": "-27.121915157767",
                        "lon": "133.21253738715",
                        "zoom": "4"
                    }
                }
            })),
        })
            .then((response: any) => response.json())
            .then((json: any) => {
                dispatch(receiveCreatedMap(json))
                // cb(json.id)
                browserHistory.push("/map/" + json.id)
            })
    }
}

/*
So, there seems to be two approaches to handling the "How do I do some action on the site (like using React-Router to change pages)?" question.

1. Pass a callback function in and call that from the action.

2. Call react-router directly from the action.

Some further reading on the subject:

- https://github.com/reactjs/redux/issues/291
- http://stackoverflow.com/questions/36886506/redux-change-url-when-an-async-action-is-dispatched
*/
export function deleteMapSuccess(mapId: number) {
  return (dispatch: any) => {
    dispatch(receiveDeleteMap(mapId))
    browserHistory.push("/");
  };
}

export function deleteMap(mapId: number/*, cb: Function*/) {
    return (dispatch: any) => {
        return fetch('/api/0.1/maps/' + encodeURIComponent(mapId.toString()) + '/', {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": cookie.load("csrftoken")
            },
        })
            .then(((response: any) => {
                if(response.status == 204) {
                    dispatch(deleteMapSuccess(mapId))
                } else {
                    var error = new Error(response.statusText)
                    error.response = response
                    // dispatch(deleteMapError(error));
                    throw error
                }
            }))
            .catch(error => { console.log('request failed', error); }); // This could be handled at a higher level through a factory (as per early examples we investigated)
    }
}