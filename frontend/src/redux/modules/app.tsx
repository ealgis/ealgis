import * as dotProp from "dot-prop-immutable"

// Actions
const LOADING = "ealgis/app/LOADING"
const LOADED = "ealgis/app/LOADED"
const BEGIN_FETCH = "ealgis/app/BEGIN_FETCH"
const FINISH_FETCH = "ealgis/app/FINISH_FETCH"
const SET_LAST_PAGE = "ealgis/app/SET_LAST_PAGE"
const TOGGLE_SIDEBAR = "ealgis/app/TOGGLE_SIDEBAR"
const TOGGLE_MODAL = "ealgis/app/TOGGLE_MODAL"
const TOGGLE_USER_MENU = "ealgis/app/TOGGLE_USER_MENU"

const initialState = {
    loading: true,
    requestsInProgress: 0,
    sidebarOpen: true,
    previousPath: "",
    modals: {},
    userMenuState: false,
}

// Reducer
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case LOADING:
            return dotProp.set(state, "loading", true)
        case LOADED:
            return dotProp.set(state, "loading", false)
        case BEGIN_FETCH:
            return dotProp.set(state, "requestsInProgress", ++state.requestsInProgress)
        case FINISH_FETCH:
            return dotProp.set(state, "requestsInProgress", --state.requestsInProgress)
        case SET_LAST_PAGE:
            return dotProp.set(state, "previousPath", action.previousPath)
        case TOGGLE_SIDEBAR:
            return dotProp.toggle(state, "sidebarOpen")
        case TOGGLE_MODAL:
            return dotProp.toggle(state, `modals.${action.modalId}`)
        case TOGGLE_USER_MENU:
            return dotProp.set(state, "userMenuState", action.open)
        default:
            return state
    }
}

// Action Creators
export function loading() {
    return {
        type: LOADING,
    }
}

export function loaded() {
    return {
        type: LOADED,
    }
}

export function beginFetch() {
    return {
        type: BEGIN_FETCH,
    }
}

export function finishFetch() {
    return {
        type: FINISH_FETCH,
    }
}

export function setLastPage(previousPath: string) {
    return {
        type: SET_LAST_PAGE,
        previousPath,
    }
}

export function toggleSidebarState() {
    return {
        type: TOGGLE_SIDEBAR,
        meta: {
            analytics: {
                category: "App",
            },
        },
    }
}

export function toggleModalState(modalId: string) {
    return {
        type: TOGGLE_MODAL,
        modalId,
    }
}

export function toggleUserMenu(open: boolean) {
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

// Models

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
