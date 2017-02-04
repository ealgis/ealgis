import * as React from "react";
import * as ReactDOM from "react-dom";
import { compose, combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import reducers from './reducers/index';
import EalUIContainerWrapped from "./components/EalUIContainer";
import MapUIContainerWrapped from "./components/MapUIContainer";
import MapUINavContainerWrapped from "./components/MapUINavContainer";
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
            <Route path="/" component={EalUIContainerWrapped}>
                <Route path="map/:mapId" components={{ content: MapUIContainerWrapped, sidebar: MapUINavContainerWrapped }}/>
                <IndexRoute components={{ content: MapList }}/>
            </Route>
        </Router>
    </Provider>,
    document.getElementById("ealgis")
);
