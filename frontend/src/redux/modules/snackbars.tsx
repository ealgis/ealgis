import * as dotProp from "dot-prop-immutable"

// Actions
const ADD_MESSAGE = "ealgis/snackbars/ADD_MESSAGE"
const START = "ealgis/snackbars/START"
const NEXT = "ealgis/snackbars/NEXT"

const initialState = {
    open: false,
    active: {
        message: "",
    },
    messages: [],
}

// Reducer
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case ADD_MESSAGE:
            state.messages.push(action.message)
            return dotProp.set(state, `messages`, state.messages)
        case START:
            if (state.open === false && state.messages.length > 0) {
                // Pop the first message off the front of the queue
                const message = state.messages.shift()
                state = dotProp.set(state, `messages`, state.messages)
                state = dotProp.set(state, `active`, message)
                state = dotProp.set(state, `open`, true)
            }
            return state
        case NEXT:
            if (state.messages.length > 0) {
                // Pop the first message off the front of the queue
                const message = state.messages.shift()
                state = dotProp.set(state, `messages`, state.messages)
                state = dotProp.set(state, `active`, message)
                return dotProp.set(state, `open`, true)
            } else {
                state = dotProp.set(state, `active`, { message: "" })
                return dotProp.set(state, `open`, false)
            }
        default:
            return state
    }
}

// Action Creators
export function addMessage(message: object) {
    return {
        type: ADD_MESSAGE,
        message,
    }
}

export function startIfNeeded() {
    return {
        type: START,
    }
}

export function next() {
    return {
        type: NEXT,
    }
}

// Models

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function iterate() {
    return (dispatch: any) => {
        return dispatch(next())
    }
}

export function sendMessage(message: object) {
    return (dispatch: any) => {
        dispatch(addMessage(message))
        return dispatch(startIfNeeded())
    }
}

export function sendNotification(message: string) {
    return (dispatch: any) => {
        return dispatch(
            sendMessage({
                message: message,
                autoHideDuration: 2500,
            })
        )
    }
}
