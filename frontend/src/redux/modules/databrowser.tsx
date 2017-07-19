import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IHttpResponse, IEALGISApiClient } from "../../shared/api/EALGISApiClient"

import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"

// Actions


const initialState: IModule = {

}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    switch (action.type) {
        
        default:
            return state
    }
}

// Action Creators


// Models
export interface IModule {

}

export interface IAction {
    type: string
    meta?: {
        analytics: IAnalyticsMeta
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
