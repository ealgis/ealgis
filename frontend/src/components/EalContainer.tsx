import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import EalUI from "./EalUI";
import { Router, Route, Link, browserHistory } from 'react-router';
import { LoginDialog } from './LoginDialog';
import { connect } from 'react-redux';
import { fetchUser, fetchMaps } from '../actions';

import './FixedLayout.css';

export interface EalContainerProps {
    user: any,
    dispatch: Function
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        const { dispatch } = this.props
        dispatch(fetchUser())
        dispatch(fetchMaps())

        // Because LiveReload still hardcodes HTTP by default
        // https://github.com/statianzo/webpack-livereload-plugin/issues/23
        if(DEVELOPMENT === true) {
            const script = document.createElement("script");
            script.src = "//localhost:35729/livereload.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }

    render() {
        const { user, children } = this.props
        return <MuiThemeProvider>
            <EalUI user={user} children={children}></EalUI>
        </MuiThemeProvider>;
    }
}

const mapStateToProps = (state: any) => {
    const { user } = state
    return {
        user
    }
}

const EalContainerWrapped = connect(
    mapStateToProps
)(EalContainer)

export default EalContainerWrapped