import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOADING = "ealgis/app/LOADING"
const LOADED = "ealgis/app/LOADED"
const BEGIN_FETCH = "ealgis/app/BEGIN_FETCH"
const FINISH_FETCH = "ealgis/app/FINISH_FETCH"
const SET_LAST_PAGE = "ealgis/app/SET_LAST_PAGE"
const TOGGLE_SIDEBAR = "ealgis/app/TOGGLE_SIDEBAR"
const TOGGLE_MODAL = "ealgis/app/TOGGLE_MODAL"
const TOGGLE_USER_MENU = "ealgis/app/TOGGLE_USER_MENU"
const SET_ACTIVE_COMPONENT = "ealgis/app/SET_ACTIVE_COMPONENT"

export enum eEalUIComponent {
    MAP_UI = 1,
    DATA_BROWSER = 2,
    FILTER_EXPRESSION_EDITOR = 3,
    VALUE_EXPRESSION_EDITOR = 4,
}

const initialState: IModule = {
    loading: true,
    requestsInProgress: 0,
    sidebarOpen: true,
    previousPath: "",
    modals: new Map(),
    userMenuState: false,
    activeContentComponent: eEalUIComponent.MAP_UI,
}

// Reducer
export default function reducer(state = initialState, action: IAction) {
    let requestsInProgress = dotProp.get(state, "requestsInProgress")

    switch (action.type) {
        case LOADING:
            return dotProp.set(state, "loading", true)
        case LOADED:
            return dotProp.set(state, "loading", false)
        case BEGIN_FETCH:
            return dotProp.set(state, "requestsInProgress", ++requestsInProgress)
        case FINISH_FETCH:
            return dotProp.set(state, "requestsInProgress", --requestsInProgress)
        case SET_LAST_PAGE:
            return dotProp.set(state, "previousPath", action.previousPath)
        case TOGGLE_SIDEBAR:
            return dotProp.toggle(state, "sidebarOpen")
        case TOGGLE_MODAL:
            const modals = dotProp.get(state, "modals")
            modals.set(action.modalId, !modals.get(action.modalId))
            return dotProp.set(state, "modals", modals)
        case TOGGLE_USER_MENU:
            return dotProp.set(state, "userMenuState", action.open)
        case SET_ACTIVE_COMPONENT:
            return dotProp.set(state, "activeContentComponent", action.contentComponent)
        default:
            return state
    }
}

// Action Creators
export function loading(): IAction {
    return {
        type: LOADING,
    }
}

export function loaded(): IAction {
    return {
        type: LOADED,
    }
}

export function beginFetch(): IAction {
    return {
        type: BEGIN_FETCH,
    }
}

export function finishFetch(): IAction {
    return {
        type: FINISH_FETCH,
    }
}

export function setLastPage(previousPath: string): IAction {
    return {
        type: SET_LAST_PAGE,
        previousPath,
    }
}

export function toggleSidebarState(): IAction {
    return {
        type: TOGGLE_SIDEBAR,
        meta: {
            analytics: {
                category: "App",
            },
        },
    }
}

export function toggleModalState(modalId: string): IAction {
    return {
        type: TOGGLE_MODAL,
        modalId,
    }
}

export function toggleUserMenu(open: boolean): IAction {
    return {
        type: TOGGLE_USER_MENU,
        open,
        meta: {
            analytics: {
                category: "App",
            },
        },
    }
}

export function setActiveContentComponent(contentComponent: eEalUIComponent) {
    return {
        type: SET_ACTIVE_COMPONENT,
        contentComponent,
    }
}

// Models
export interface IModule {
    loading: boolean
    requestsInProgress: number
    sidebarOpen: boolean
    previousPath: string
    modals: Map<string, boolean>
    userMenuState: boolean
    activeContentComponent: eEalUIComponent
}

export interface IAction {
    type: string
    previousPath?: string
    modalId?: string
    open?: boolean
    contentComponent?: eEalUIComponent
    meta?: {
        analytics: IAnalyticsMeta
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
