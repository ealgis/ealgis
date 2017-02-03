import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Router, Route, Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Map, View, layer, source, Feature, geom } from 'ol-react';
import * as ol from 'openlayers';

export interface MapUIProps { defn: any }

export class MapUI extends React.Component<MapUIProps, undefined> {
    render() {
        const { defn } = this.props

        if(defn.json !== undefined) {
            // FIXME Fix the map definitions
            const zoom = parseInt(defn.json.map_defaults.zoom)
            const center = ol.proj.transform([parseFloat(defn.json.map_defaults.lon), parseFloat(defn.json.map_defaults.lat)], 'EPSG:4326', 'EPSG:900913')
            const view = <View zoom={zoom} center={center}/>

            const layerObj = defn.json.layers[0]

            // For ImageWMS (Single image tile.)
            // const url = "https://localhost:8443/geoserver/EALGIS/wms"
            // const params = {'LAYERS': 'EALGIS:93493a38', 'SRS': 'EPSG:900913'}

            // For TileWMS (Multiple image tiles.)
            // const urls = [
            //     'https://gs1.localhost:8443/geoserver/gwc/service/wms',
            //     'https://gs2.localhost:8443/geoserver/gwc/service/wms',
            //     'https://gs3.localhost:8443/geoserver/gwc/service/wms',
            //     'https://gs4.localhost:8443/geoserver/gwc/service/wms',
            // ]
            // const params = {'LAYERS': 'EALGIS:93493a38', 'TILED': true, 'SRS': 'EPSG:900913'}

            // For VectorTiles
            // http://openlayers.org/en/latest/apidoc/ol.html#.Extent
            const bbox = layerObj._geoserver_layer_bbox
            const extent = ol.proj.transformExtent([bbox.minx, bbox.miny, bbox.maxx, bbox.maxy], 'EPSG:4326', 'EPSG:900913')

            const projection_epsg_no = '900913';
            const format = "pbf";
            const layerName = layerObj._geoserver_workspace + ":" + layerObj.hash;
            const url = "https://gs{1-4}.localhost:8443/geoserver/gwc/service/tms/1.0.0/" + layerName + "@EPSG%3A" + projection_epsg_no + "@" + format + "/{z}/{x}/{-y}." + format
            const formatObj = new ol.format.MVT()
            const tileGrid = ol.tilegrid.createXYZ({maxZoom: 22})
            const overlaps = false
            const cacheSize = 256
            const visible = layerObj.visible

            return <Map view={view}>
                <layer.Tile>
                    <source.OSM />
                </layer.Tile>
                <layer.VectorTile visible={visible} extent={extent}>
                    <source.VectorTile url={url} format={formatObj} tileGrid={tileGrid} overlaps={overlaps} cacheSize={cacheSize}>
                    </source.VectorTile>
                </layer.VectorTile>
            </Map>
        }

        return <div></div>
    }
}

export default MapUI