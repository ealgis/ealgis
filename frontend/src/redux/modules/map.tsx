import * as dotProp from "dot-prop-immutable"

// Actions
const TOGGLE_DEBUG_MODE = "ealgis/map/TOGGLE_DEBUG_MODE"
const SAVE_POSITION = "ealgis/map/SAVE_POSITION"
const RESTORE_DEFAULT_POSITION = "ealgis/map/RESTORE_DEFAULT_POSITION"
const LOAD_HIGHLIGHTED_FEATURES = "ealgis/map/LOAD_HIGHLIGHTED_FEATURES"
const RECEIVE_GOOGLE_PLACES_RESULT = "ealgis/map/RECEIVE_GOOGLE_PLACES_RESULT"

const initialState = {
    debug: false,
    position: {},
    highlightedFeatures: [],
}

// Reducer
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case TOGGLE_DEBUG_MODE:
            return dotProp.toggle(state, "debug")
        case SAVE_POSITION:
        case RESTORE_DEFAULT_POSITION:
            return dotProp.set(state, `position`, action.position)
        case LOAD_HIGHLIGHTED_FEATURES:
            return dotProp.set(state, "highlightedFeatures", action.featurGids)
        default:
            return state
    }
}

// Action Creators
export function toggleDebugMode() {
    return {
        type: TOGGLE_DEBUG_MODE,
    }
}

export function savePosition(position: object) {
    return {
        type: SAVE_POSITION,
        position,
    }
}

export function restoreDefaultPosition(position: object) {
    return {
        type: RESTORE_DEFAULT_POSITION,
        position,
        meta: {
            analytics: {
                category: "Map",
            },
        },
    }
}

export function setHighlightedFeatures(featurGids: Array<number>) {
    return {
        type: LOAD_HIGHLIGHTED_FEATURES,
        featurGids,
    }
}

export function receiveGooglePlacesResult() {
    return {
        type: RECEIVE_GOOGLE_PLACES_RESULT,
        meta: {
            analytics: {
                category: "Map",
            },
        },
    }
}

// Models

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function restoreDefaultMapPosition(mapDefaults: any) {
    return (dispatch: any) => {
        dispatch(
            restoreDefaultPosition({
                center: mapDefaults.center,
                zoom: mapDefaults.zoom,
                allowUpdate: true,
            })
        )
    }
}

export function moveToPosition(mapDefaults: any) {
    return (dispatch: any) => {
        dispatch(
            savePosition({
                center: mapDefaults.center,
                zoom: mapDefaults.zoom,
                allowUpdate: true,
            })
        )
    }
}

export function moveToGooglePlacesResult(extent: Array<number>) {
    return (dispatch: any) => {
        dispatch(receiveGooglePlacesResult())
        dispatch(
            savePosition({
                extent: extent,
                zoom: 18,
                allowUpdate: true,
            })
        )
    }
}
