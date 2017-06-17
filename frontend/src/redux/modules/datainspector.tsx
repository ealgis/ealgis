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

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function loadRecords(mapId: number, features: Array<undefined>) {
    return (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        features.forEach((feature: any) => {
            const featureProps = feature.featureProps
            const map = getMapFromState(getState, feature.mapId)
            const layer = map.json.layers[feature.layerId]

            ealapi
                .get(`/api/0.1/datainfo/${layer.geometry}/?schema=${layer.schema}&gid=${featureProps.gid}`, dispatch)
                .then(({ response, json }: any) => {
                    let dataRowProps: Array<any> = [
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

                    dispatch(
                        load([
                            {
                                name: `Layer ${layer.name}`,
                                properties: dataRowProps,
                            },
                        ])
                    )

                    browserHistory.push(getMapURL(map) + "/data")
                })
        })
    }
}
