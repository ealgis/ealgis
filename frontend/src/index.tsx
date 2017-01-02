import * as React from "react";
import * as ReactDOM from "react-dom";
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import reducers from './reducers/index';
import { EalUI } from "./components/EalUI";


const store = createStore(
    combineReducers({
        ...reducers,
    routing: routerReducer
}));

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={EalUI}></Route>
        </Router>
    </Provider>,
    document.getElementById("ealgis")
);
