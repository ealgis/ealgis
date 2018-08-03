import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IGeomInfo, ILayer, IMap, ITable } from "./interfaces"

// Actions
const TOGGLE_DEBUG_MODE = "ealgis/map/TOGGLE_DEBUG_MODE"
const SAVE_POSITION = "ealgis/map/SAVE_POSITION"
const RESTORE_DEFAULT_POSITION = "ealgis/map/RESTORE_DEFAULT_POSITION"
const LOAD_HIGHLIGHTED_FEATURES = "ealgis/map/LOAD_HIGHLIGHTED_FEATURES"
const RECEIVE_GOOGLE_PLACES_RESULT = "ealgis/map/RECEIVE_GOOGLE_PLACES_RESULT"

const initialState: IModule = {
    debug: false,
    position: {},
    highlightedFeatures: [],
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
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
export function toggleDebugMode(): IAction {
    return {
        type: TOGGLE_DEBUG_MODE,
    }
}

export function savePosition(position: IPosition): IAction {
    return {
        type: SAVE_POSITION,
        position,
    }
}

export function restoreDefaultPosition(position: IPosition): IAction {
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

export function setHighlightedFeatures(featurGids: Array<number>): IAction {
    return {
        type: LOAD_HIGHLIGHTED_FEATURES,
        featurGids,
    }
}

export function receiveGooglePlacesResult(): IAction {
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
export interface IModule {
    debug: boolean
    position: IPosition
    highlightedFeatures: Array<number>
}

export interface IAction {
    type: string
    position?: IPosition
    featurGids?: Array<number>
    meta?: {
        analytics: IAnalyticsMeta
    }
}

export interface IPosition {
    center?: Array<number>
    zoom?: number
    resolution?: number
    extent?: Array<number>
    allowUpdate?: boolean
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function restoreDefaultMapPosition(position: IPosition) {
    return (dispatch: any) => {
        dispatch(restoreDefaultPosition(Object.assign(position, { allowUpdate: true })))
    }
}

export function moveToPosition(position: IPosition) {
    return (dispatch: any) => {
        dispatch(savePosition(Object.assign(position, { allowUpdate: true })))
    }
}

export function moveToGooglePlacesResult(extent: Array<number>) {
    return (dispatch: any) => {
        dispatch(receiveGooglePlacesResult())

        const position: IPosition = {
            extent: extent,
            zoom: 18,
            allowUpdate: true,
        }
        dispatch(savePosition(position))
    }
}

// Utilities
export function getMapTablesDescriptions(tables: Array<ITable>) {
    return tables
        .map((table: ITable, idx: number) => {
            return `${table.metadata_json.type} (${table.metadata_json.kind})`
        })
        .join(", ")
}

export function getMapGeometryDescriptions(map: IMap, geominfo: IGeomInfo) {
    return new Set(
        map.json.layers.map((layer: ILayer, idx: number) => {
            const ginfo = geominfo[`${layer.schema}.${layer.geometry}`]
            return ginfo.description
        })
    )
        .toJSON()
        .join(", ")
}
