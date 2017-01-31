import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Link } from 'react-router';
import { connect } from 'react-redux';

export interface MapListProps { maps: any }

export class MapList extends React.Component<MapListProps, undefined> {
    render() {
        const { maps } = this.props
        return <ul>
            {maps.map((m) => <li key={m.id}><Link to={`/map/${m.id}`}>{m.name}</Link></li>}
            </ul>;
    }
}

const mapStateToProps = (state: any) => {
    const { maps } = state
    return {
        maps
    }
}

const MapListWrapped = connect(
    mapStateToProps
)(MapList)

export default MapListWrapped
