import "es6-promise/auto"
import * as createRavenMiddleware from "raven-for-redux"
import * as Raven from "raven-js"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { Router, browserHistory } from "react-router"
// @ts-ignore
import { syncHistoryWithStore } from "react-router-redux"
import { Store, applyMiddleware, createStore } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import thunkMiddleware from "redux-thunk"
import { IConfig, IStore } from "./redux/modules/interfaces"
import reducers from "./redux/modules/reducer"
import getRoutes from "./routes"
import { AnalyticsMiddleware, fireAnalyticsTracking } from "./shared/analytics/GoogleAnalytics"
import { EALGISApiClient } from "./shared/api/EALGISApiClient"
const Config: IConfig = require("Config") as any

let Middleware: Array<any> = []

if (process.env.NODE_ENV === "production" && "RAVEN_URL" in Config) {
    Raven.config(Config["RAVEN_URL"]).install()
    Middleware.push(createRavenMiddleware(Raven))
}

if ("GOOGLE_ANALYTICS_UA" in Config) {
    Middleware.push(AnalyticsMiddleware as any)
}

const ealapi = new EALGISApiClient()

const composeEnhancers = composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
})
const store: Store<IStore> = createStore(
    reducers,
    composeEnhancers(applyMiddleware(thunkMiddleware.withExtraArgument(ealapi), ...Middleware))
)

const history = syncHistoryWithStore(browserHistory as any, store)

ReactDOM.render(
    <Provider store={store}>
        <Router history={history as any} onUpdate={"GOOGLE_ANALYTICS_UA" in Config ? fireAnalyticsTracking : () => {}}>
            {getRoutes(store as any)}
        </Router>
    </Provider>,
    document.getElementById("ealgis")
)
