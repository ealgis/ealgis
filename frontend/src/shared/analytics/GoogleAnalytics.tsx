import * as ReactGA from "react-ga"
import * as actions from "../../actions"

// FIXME Where should config props like API keys live?
ReactGA.initialize("UA-100057077-1")

class GATracker {
    verbose: boolean
    always_send: boolean

    constructor(verbose: boolean = false, always_send: boolean = false) {
        this.verbose = verbose
        this.always_send = always_send
    }

    pageview(path: string) {
        if (DEVELOPMENT === false || this.always_send === true) {
            ReactGA.set({ page: path })
            ReactGA.pageview(path)
        }

        if (this.verbose === true) {
            console.log("GATracker:pageview", path)
        }
    }

    event(cfg: object) {
        if (DEVELOPMENT === false || this.always_send === true) {
            ReactGA.event(cfg)
        }

        if (this.verbose === true) {
            console.log("GATracker:event", cfg)
        }
    }
}

const gaTrack = new GATracker()

const AnalyticsMiddleware = store => next => action => {
    switch (action.type) {
        case actions.RECEIVE_TOGGLE_SIDEBAR_STATE:
        case actions.RECEIVE_UPDATE_DATA_DISCOVERY:
        case actions.RECEIVE_LEGENDPEEK_LABEL:
        case actions.RECEIVE_GOOGLE_PLACES_RESULT:
            gaTrack.event({
                category: "UI",
                action: action.type,
            })
            break

        case actions.RECEIVE_MAP_MOVE_END:
        case actions.RECEIVE_UPDATE_DATA_INSPECTOR:
            gaTrack.event({
                category: "Map",
                action: action.type,
            })
            break

        case actions.CREATE_MAP:
        case actions.DELETE_MAP:
        case actions.RECEIVE_DELETE_MAP_LAYER:
        case actions.RECEIVE_CLONE_MAP_LAYER:
        case actions.CHANGE_LAYER_VISIBILITY:
        case actions.RECEIVE_SET_MAP_ORIGIN:
        case actions.COMPILED_LAYER_STYLE:
        case actions.CHANGE_MAP_SHARING:
        case actions.RECEIVE_RESET_MAP_POSITION:
        case actions.RECEIVE_SET_MAP_POSITION:
        case actions.RECEIVE_BEGIN_PUBLISH_LAYER:
        case actions.RECEIVE_BEGIN_RESTORE_MASTER_LAYER:
        case actions.RECEIVE_ADD_NEW_LAYER:
        case actions.RECEIVE_LAYER_FORM_CHANGED:
        case actions.RECEIVE_START_LAYER_EDIT_SESSION:
        case actions.RECEIVE_FIT_SCALE_TO_DATA:
            gaTrack.event({
                category: "Maps",
                action: action.type,
            })
            break

        default:
        // console.log(action.type)
    }

    let result = next(action)
    return result
}

const fireAnalyticsTracking = () => {
    gaTrack.pageview(window.location.pathname + window.location.search)
}

export { AnalyticsMiddleware, fireAnalyticsTracking }
