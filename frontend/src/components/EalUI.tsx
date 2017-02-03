import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import { Router, Route, Link, browserHistory } from 'react-router';
import { LoginDialog } from './LoginDialog';
import { connect } from 'react-redux';
import { fetchUser, fetchMaps } from '../actions';

import './FixedLayout.css';

export interface EalUIProps {
    user: any,
}

export class EalUI extends React.Component<EalUIProps, undefined> {
    render() {
        const { user } = this.props
        {/*return <div className="page">
            <div className="page-header">
                <AppBar title={user.username} />
            </div>
            <div className="page-content">
                <LoginDialog open={user.url === null} />
                {this.props.children || <div></div>}
            </div>
        </div>;*/}

        return <div className="page">
            <div className="page-header">
                <AppBar title={user.username} />
            </div>
            <div className="page-content">
                <LoginDialog open={user.url === null} />
                {this.props.children || <div></div>}
            </div>
        </div>
    }
}

export default EalUI