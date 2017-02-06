import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Router, Route, Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import * as olr from 'ol-react';
import * as ol from 'openlayers';

export interface LayerProps {
    map: any,
    layer: any
}

export class Layer extends React.Component<LayerProps, undefined> {
    render() {
        const { layer } = this.props

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
        const bbox = layer._geoserver_layer_bbox
        const extent = ol.proj.transformExtent([bbox.minx, bbox.miny, bbox.maxx, bbox.maxy], 'EPSG:4326', 'EPSG:900913')

        const projection_epsg_no = '900913';
        const format = "pbf";
        const layerName = layer._geoserver_workspace + ":" + layer.hash;
        const url = "https://gs{1-4}.localhost:8443/geoserver/gwc/service/tms/1.0.0/" + layerName + "@EPSG%3A" + projection_epsg_no + "@" + format + "/{z}/{x}/{-y}." + format
        const formatObj = new ol.format.MVT()
        const tileGrid = ol.tilegrid.createXYZ({maxZoom: 22})
        const overlaps = false
        const cacheSize = 256
        const visible = layer.visible

        return <olr.layer.VectorTile visible={visible} extent={extent} style={layer.olStyle}>
            <olr.source.VectorTile url={url} format={formatObj} tileGrid={tileGrid} overlaps={overlaps} cacheSize={cacheSize}>
            </olr.source.VectorTile>
        </olr.layer.VectorTile>
    }
}

export default Layer