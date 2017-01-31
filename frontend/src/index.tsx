import * as React from "react";
import * as ReactDOM from "react-dom";
import { compose, combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import reducers from './reducers/index';
import EalContainerWrapped from "./components/EalContainer";
import MapContainerWrapped from "./components/MapContainer";
import MapList from "./components/MapList";
import thunkMiddleware from 'redux-thunk'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    combineReducers({
        ...reducers,
        routing: routerReducer,
    }),
    composeEnhancers(applyMiddleware(
        thunkMiddleware
    ))
);

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={EalContainerWrapped}>
                <Route path="map/:mapId" component={MapContainerWrapped}/>
                <IndexRoute component={MapList}/>
            </Route>
        </Router>
    </Provider>,
    document.getElementById("ealgis")
);
