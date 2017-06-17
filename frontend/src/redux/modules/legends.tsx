import * as dotProp from "dot-prop-immutable"

// Actions
const SET_LEGENDPEEK_LABEL = "ealgis/legends/SET_LEGENDPEEK_LABEL"

const initialState = {
    legendpeek: {},
}

// Reducer
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_LEGENDPEEK_LABEL:
            return dotProp.set(state, `legendpeek.${action.mapId + "-" + action.layerId}`, action.labelText)
        default:
            return state
    }
}

// Action Creators
export function receiveLegendPeekLabel(mapId: number, layerId: number, labelText: string) {
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

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
