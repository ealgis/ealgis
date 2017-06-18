import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const SET_LEGENDPEEK_LABEL = "ealgis/legends/SET_LEGENDPEEK_LABEL"

const initialState: IModule = {
    legendpeek: {},
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case SET_LEGENDPEEK_LABEL:
            return dotProp.set(state, `legendpeek.${action.mapId + "-" + action.layerId}`, action.labelText)
        default:
            return state
    }
}

// Action Creators
export function receiveLegendPeekLabel(mapId: number, layerId: string, labelText: string): IAction {
    return {
        type: SET_LEGENDPEEK_LABEL,
        mapId,
        layerId,
        labelText,
        meta: {
            analytics: {
                category: "Legends",
            },
        },
    }
}

// Models
export interface IModule {
    legendpeek: {
        [key: string]: string
    }
}

export interface IAction {
    type: string
    meta?: {
        analytics: IAnalyticsMeta
    }
    mapId: number
    layerId: string
    labelText: string
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
