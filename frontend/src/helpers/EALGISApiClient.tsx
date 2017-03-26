import 'whatwg-fetch'
import cookie from 'react-cookie'
import { addNewSnackbarMessageAndStartIfNeeded, handleIterateSnackbar } from '../actions'

export class EALGISApiClient {
    // Only handles fatal errors from the API
    // FIXME Refactor to be able to handle errors that the calling action can't handle
    public handleError(error: any, url: string, dispatch: any) {
        dispatch(addNewSnackbarMessageAndStartIfNeeded({
            message: `Error from ${url}`,
            // key: "SomeUID",
            action: "Dismiss",
            autoHideDuration: 4000,
            onActionTouchTap: () => {
                dispatch(handleIterateSnackbar())
            },
        }));
    }

    public get(url: string, dispatch: any) {
        return fetch(url, {
            credentials: "same-origin",
        })
        .then((response: any) => response.json().then((json: any) => ({
            response: response,
            json: json,
        })))
        .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public post(url: string, body: object, dispatch: any) {
        return fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.load("csrftoken")
            },
            body: JSON.stringify(body),
        })
        .then((response: any) => response.json().then((json: any) => ({
            response: response,
            json: json,
        })))
        .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public put(url: string, body: object, dispatch: any) {
        return fetch(url, {
            method: "PUT",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.load("csrftoken")
            },
            body: JSON.stringify(body),
        })
        .then((response: any) => response.json().then((json: any) => ({
            response: response,
            json: json,
        })))
        .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public delete(url: string, dispatch: any) {
        return fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": cookie.load("csrftoken")
            },
        })
        .catch((error: any) => this.handleError(error, url, dispatch))
    }
}