import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Router, Route, Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Map, View, layer, source, Feature, geom } from 'ol-react';
import TileWMS from '../ol/TileWMS';
import * as ol from 'openlayers';

export interface MapUIProps { defn: any }

export class MapUI extends React.Component<MapUIProps, undefined> {
    render() {
        const { defn } = this.props

        if(defn.json !== undefined) {
            // FIXME Fix the map definitions
            const zoom = parseInt(defn.json.map_defaults.zoom);
            const center = ol.proj.transform([parseFloat(defn.json.map_defaults.lon), parseFloat(defn.json.map_defaults.lat)], 'EPSG:4326', 'EPSG:900913');
            
            const view = <View zoom={zoom} center={center}/>;
            return <Map view={view}>
                <layer.Tile>
                    <source.OSM />
                </layer.Tile>
                <layer.Tile>
                    <TileWMS>
                    </TileWMS>
                </layer.Tile>
            </Map>
        }

        return <div></div>
    }
}

export default MapUI