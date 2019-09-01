import * as ReactGA from "react-ga"
import { IConfig } from "../../redux/modules/interfaces"
import { IStore } from "../../redux/modules/reducer"
declare var Config: IConfig

if ("GOOGLE_ANALYTICS_UA" in Config) {
    ReactGA.initialize(Config["GOOGLE_ANALYTICS_UA"])
}

class GATracker {
    verbose: boolean
    always_send: boolean

    constructor(verbose: boolean = false, always_send: boolean = false) {
        this.verbose = verbose
        this.always_send = always_send
    }

    pageview(path: string) {
        if (Config["ENVIRONMENT"] === "PRODUCTION" || this.always_send === true) {
            ReactGA.set({ page: path })
            ReactGA.pageview(path)
        }

        if (this.verbose === true) {
            console.log("GATracker:pageview", path)
        }
    }

    event(cfg: ReactGA.EventArgs) {
        if (cfg.hasOwnProperty("action") === false) {
            cfg.action = "n/a"
        }

        if (Config["ENVIRONMENT"] === "PRODUCTION" || this.always_send === true) {
            ReactGA.event(cfg)
        }

        if (this.verbose === true) {
            console.log("GATracker:event", cfg)
        }
    }
}

const gaTrack = new GATracker()

const AnalyticsMiddleware = (store: IStore) => (next: Function) => (action: any) => {
    if ("meta" in action && "analytics" in action.meta) {
        gaTrack.event(Object.assign(action.meta.analytics, { type: action.type }))
    }

    let result = next(action)
    return result
}

const fireAnalyticsTracking = () => {
    gaTrack.pageview(window.location.pathname + window.location.search)
}

export interface IAnalyticsMeta {
    category: string
    type?: string
    payload?: {
        [key: string]: any
    }
}

export { AnalyticsMiddleware, fireAnalyticsTracking }
