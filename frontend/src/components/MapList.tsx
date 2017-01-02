import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Router, Route, Link, browserHistory } from 'react-router';

export interface MapListProps { }

export class MapList extends React.Component<MapListProps, undefined> {
    render() {
        return <ul>
        <li>it is a map</li>
        </ul>
    }
}
