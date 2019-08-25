import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { browserHistory } from "react-router"
import { getMapURL } from "../../shared/utils"
import { getMapFromState } from "../../redux/modules/maps"

// Actions
const LOAD = "ealgis/datainspector/LOAD"
const RESET = "ealgis/datainspector/RESET"

const initialState: IModule = {
    records: [],
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        case LOAD:
            return dotProp.set(state, "records", action.records)
        case RESET:
            return dotProp.set(state, "records", [])
        default:
            return state
    }
}

// Action Creators
export function load(records: Array<IFeature>): IAction {
    return {
        type: LOAD,
        records,
        meta: {
            analytics: {
                category: "DataInspector",
            },
        },
    }
}

export function reset(): IAction {
    return {
        type: RESET,
    }
}

// Models
export interface IModule {
    records: Array<IFeature>
}

export interface IAction {
    type: string
    meta?: {
        analytics: IAnalyticsMeta
    }
    records?: Array<IFeature>
}

export interface IFeature {
    name: string
    properties: Array<IFeatureProps>
}

export interface IFeatureProps {
    name: string
    value: any
}

export interface IOLFeature {
    mapId: number
    layerId: number
    featureProps: IOLFeatureProps
}

export interface IOLFeatureProps {
    gid: number
    q: number
    geometry: object
    get(attributeName: string): any
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function loadRecords(mapId: number, features: Array<IOLFeature>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const map = getMapFromState(getState, mapId)
        const records: Array<IFeature> = []

        await Promise.all(
            features.map(async (olFeature: IOLFeature) => {
                const featureProps: IOLFeatureProps = olFeature.featureProps
                const layer = map.json.layers[olFeature.layerId]

                const { json } = await ealapi.get(
                    `/api/0.1/datainfo/${layer.geometry}/?schema=${layer.schema}&gid=${featureProps.gid}`,
                    dispatch
                )

                // Initialise properties list with the value "q" that resulted from the query expression
                let dataRowProps: Array<IFeatureProps> = [
                    {
                        name: "Value",
                        value: featureProps.q,
                    },
                ]

                for (let key in json) {
                    if (key !== "gid") {
                        dataRowProps.push({
                            name: key,
                            value: json[key],
                        })
                    }
                }

                records.push({
                    name: `Layer ${layer.name}`,
                    properties: dataRowProps,
                })
            })
        )

        dispatch(load(records))
        browserHistory.push(getMapURL(map) + "/data")
    }
}
