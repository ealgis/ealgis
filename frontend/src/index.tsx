import "es6-promise"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { compose, combineReducers, createStore, applyMiddleware } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import { Provider } from "react-redux"
import { Router, Route, IndexRoute, browserHistory } from "react-router"
import { syncHistoryWithStore, routerReducer } from "react-router-redux"
import thunkMiddleware from "redux-thunk"
import { AnalyticsMiddleware, fireAnalyticsTracking } from "./shared/analytics/GoogleAnalytics"
import * as Raven from "raven-js"
import * as createRavenMiddleware from "raven-for-redux"
import getRoutes from "./routes"

import * as injectTapEventPlugin from "react-tap-event-plugin"
injectTapEventPlugin()

declare var DEVELOPMENT: boolean

// FIXME
Raven.config("https://43c72d220a2140e4b36fb75c5042f6e0@sentry.io/173078").install()

import reducers from "./redux/modules/reducer"

import { EALGISApiClient } from "./shared/api/EALGISApiClient"
const ealapi = new EALGISApiClient()

const composeEnhancers = composeWithDevTools(
    {
        // Specify name here, actionsBlacklist, actionsCreators and other options if needed
    }
)
const store = createStore(
    reducers,
    composeEnhancers(
        applyMiddleware(thunkMiddleware.withExtraArgument(ealapi), AnalyticsMiddleware, createRavenMiddleware(Raven))
    )
)

const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
    <Provider store={store}>
        <Router history={history} onUpdate={fireAnalyticsTracking}>
            {getRoutes(store)}
        </Router>
    </Provider>,
    document.getElementById("ealgis")
)
