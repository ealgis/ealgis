import * as dotProp from "dot-prop-immutable"

// Actions
const LOAD = "ealgis/layerquerysummary/LOAD"

const initialState = {
    layers: {},
}

// Reducer
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case LOAD:
            return dotProp.set(state, `layers.${action.layerHash}`, action.stats)
        default:
            return state
    }
}

// Action Creators
export function load(stats: object, layerHash: string) {
    return {
        type: LOAD,
        stats,
        layerHash,
    }
}

// Models

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetch(mapId: number, layerHash: string) {
    return (dispatch: Function, getState: Function, ealapi: object) => {
        const payload = { layer: layerHash }
        return ealapi
            .get(`/api/0.1/maps/${mapId}/query_summary/`, dispatch, payload)
            .then(({ response, json }: any) => {
                dispatch(load(json, layerHash))
            })
    }
}
