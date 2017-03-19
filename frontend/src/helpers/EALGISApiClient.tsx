import 'whatwg-fetch'
import cookie from 'react-cookie'

export class EALGISApiClient {
    public get(url: string) {
        return fetch(url, {
            credentials: "same-origin",
        })
        .then((response: any) => response.json().then((json: any) => ({
            response: response,
            json: json,
        })))
        .catch((error: any) => {
            // if(error instanceof SubmissionError) {
            throw error;
            // } else {
                // throw new SubmissionError({_error: error.message});
            // }
        })
    }

    public post(url: string, body: object) {
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
    }

    public put(url: string, body: object) {
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
    }

    public delete(url: string) {
        return fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": cookie.load("csrftoken")
            },
        })
    }
}