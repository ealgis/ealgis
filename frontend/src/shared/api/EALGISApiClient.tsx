import * as Cookies from "js-cookie";
import * as qs from "qs";
import * as Raven from "raven-js";
import "whatwg-fetch";
import { beginFetch, finishFetch } from "../../redux/modules/app";
import { iterate as iterateSnackbar, sendMessage as sendSnackbarMessage } from "../../redux/modules/snackbars";

export class EALGISApiClient {
    // Only handles fatal errors from the API
    // FIXME Refactor to be able to handle errors that the calling action can't handle
    public handleError(error: any, url: string, dispatch: any) {
        Raven.captureException(error)
        Raven.showReportDialog({})

        dispatch(
            sendSnackbarMessage({
                message: `Error from ${url}`,
                action: "Dismiss",
                autoHideDuration: 4000,
                onActionClick: () => {
                    dispatch(iterateSnackbar())
                },
            })
        )
    }

    public get(url: string, dispatch: Function, params: object = {}, allow_404: boolean = true): Promise<void> {
        dispatch(beginFetch())

        if (Object.keys(params).length > 0) {
            // Yay, a library just to do query string operations for fetch()
            // https://github.com/github/fetch/issues/256
            url += "?" + qs.stringify(params)
        }

        return fetch(url, {
            credentials: "same-origin",
        })
            .then((response: any) => {
                dispatch(finishFetch())
                if ((response.status >= 200 && response.status < 300) || (allow_404 === true && response.status === 404)) {
                    return response.json().then((json: any) => ({
                        response: response,
                        json: json,
                    }))
                } else {
                    var error: any = new Error(response.statusText || response.status)
                    error.response = response
                    return Promise.reject(error)
                }
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public post(url: string, body: object, dispatch: any, allow_404: boolean = false) {
        dispatch(beginFetch())

        return fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken")!,
            },
            body: JSON.stringify(body),
        })
            .then((response: any) => {
                dispatch(finishFetch())
                if ((response.status >= 200 && response.status < 300) || (allow_404 === true && response.status === 404)) {
                    return response.json().then((json: any) => ({
                        response: response,
                        json: json,
                    }))
                } else {
                    var error: any = new Error(response.statusText || response.status)
                    error.response = response
                    return Promise.reject(error)
                }
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public put(url: string, body: object, dispatch: any, quiet: boolean = false, allow_404: boolean = false) {
        if (quiet === false) {
            dispatch(beginFetch())
        }

        return fetch(url, {
            method: "PUT",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken")!,
            },
            body: JSON.stringify(body),
        })
            .then((response: any) => {
                if (quiet === false) {
                    dispatch(finishFetch())
                }

                if ((response.status >= 200 && response.status < 300) || (allow_404 === true && response.status === 404)) {
                    return response.json().then((json: any) => ({
                        response: response,
                        json: json,
                    }))
                } else {
                    var error: any = new Error(response.statusText || response.status)
                    error.response = response
                    return Promise.reject(error)
                }
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public delete(url: string, dispatch: any, allow_404: boolean = false) {
        dispatch(beginFetch())

        return fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": Cookies.get("csrftoken")!,
            },
        })
            .then((response: any) => {
                dispatch(finishFetch())
                if ((response.status >= 200 && response.status < 300) || (allow_404 === true && response.status === 404)) {
                    return response
                } else {
                    var error: any = new Error(response.statusText || response.status)
                    error.response = response
                    return Promise.reject(error)
                }
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }
}

// Models
export interface IEALGISApiClient {
    handleError: Function
    get: Function
    post: Function
    put: Function
    delete: Function
}

export interface IHttpResponse {
    status: number
}
