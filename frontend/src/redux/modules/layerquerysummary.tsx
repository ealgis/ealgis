import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IEALGISApiClient } from "../../shared/api/EALGISApiClient"

// Actions
const LOAD = "ealgis/layerquerysummary/LOAD"

const initialState: IModule = {
    layers: {},
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case LOAD:
            return dotProp.set(state, `layers.${action.layerHash}`, action.stats)
        default:
            return state
    }
}

// Action Creators
export function load(stats: ILayerQuerySummary, layerHash: string): IAction {
    return {
        type: LOAD,
        stats,
        layerHash,
    }
}

// Models
export interface IModule {
    layers: {
        [key: string]: ILayerQuerySummary
    }
}

export interface IAction {
    type: string
    stats: ILayerQuerySummary
    layerHash: string
    meta?: {
        analytics: IAnalyticsMeta
    }
}

export interface ILayerQuerySummary {
    min: number
    max: number
    stdddev: number
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetch(mapId: number, layerHash: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.get(`/api/0.1/maps/${mapId}/query_summary/`, dispatch, {
            layer: layerHash,
        })
        dispatch(load(json, layerHash))
    }
}
