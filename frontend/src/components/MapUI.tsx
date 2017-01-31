import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Router, Route, Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';

export interface MapUIProps { defn: any }

export class MapUI extends React.Component<MapUIProps, undefined> {
    render() {
        const { defn } = this.props
        return <div><pre>{JSON.stringify(defn)}</pre></div>;
    }
}

export default MapUI
