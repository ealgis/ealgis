import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import { Router, Route, Link, browserHistory } from 'react-router';
import { LoginDialog } from './LoginDialog';

import './FixedLayout.css';

export interface EalUIProps { }

export class EalUI extends React.Component<EalUIProps, undefined> {
    render() {
        return <MuiThemeProvider>
        <div className="page">
            <div className="page-header">
                <AppBar title="ealgis" />
            </div>
            <div className="page-content">
                <LoginDialog />
                {this.props.children || <p><Link to="/login">Log in</Link></p>}
            </div>
        </div>
        </MuiThemeProvider>;
    }
}
