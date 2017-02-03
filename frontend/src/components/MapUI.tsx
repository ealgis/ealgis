import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Router, Route, Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import LayerContainerWrapped from './LayerContainer';
import * as olr from 'ol-react';
import * as ol from 'openlayers';

export interface MapUIProps { defn: any }

export class MapUI extends React.Component<MapUIProps, undefined> {
    render() {
        const { defn } = this.props

        if(defn.json !== undefined) {
            // FIXME Fix the map definitions
            const zoom = parseInt(defn.json.map_defaults.zoom)
            const center = ol.proj.transform([parseFloat(defn.json.map_defaults.lon), parseFloat(defn.json.map_defaults.lat)], 'EPSG:4326', 'EPSG:900913')
            const view = <olr.View zoom={zoom} center={center}/>

            // FIXME Layers should be an array, not an object
            let layerObjs = []
            for (let l in defn.json.layers) {
                layerObjs.push(defn.json.layers[l])
            }

            return <olr.Map view={view}>
                <olr.layer.Tile>
                    <olr.source.OSM />
                </olr.layer.Tile>
                <div style={{display: 'none'}}>
                    {layerObjs.map((l: any) => {
                        return <LayerContainerWrapped key={l.hash} map={defn} layer={l}></LayerContainerWrapped>
                    })}
                </div>
            </olr.Map>
        }

        return <div></div>
    }
}

export default MapUI