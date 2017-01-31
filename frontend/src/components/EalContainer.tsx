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