import * as React from "react";
import LayerContainerWrapped from './LayerContainer';
import * as olr from 'ol-react';
import * as ol from 'openlayers';

export interface MapUIProps {
    defn: any,
}

export class MapUI extends React.Component<MapUIProps, undefined> {
    render() {
        const { defn } = this.props
        let zoom = 4
        let center = ol.proj.transform([135, -27], 'EPSG:4326', 'EPSG:900913')
        let layerObjs = []

        const mapbox_key = "pk.eyJ1Ijoia2VpdGhtb3NzIiwiYSI6IjkxMTViNjcxN2U5ZDBjMTYzYzY2MzQwNTJkZjM1NGFkIn0.HS40UI-OD5lQWBxUCZOwZg" // Where should this live?
        const mapbox_url = `https://api.mapbox.com/styles/v1/keithmoss/citje9al5004f2ipg4tc3neyi/tiles/256/{z}/{x}/{y}?access_token=${mapbox_key}`

        if(defn !== undefined && defn.json !== undefined) {
            // FIXME Fix the map definitions
            const zoom = parseInt(defn.json.map_defaults.zoom)
            const center = ol.proj.transform([parseFloat(defn.json.map_defaults.lon), parseFloat(defn.json.map_defaults.lat)], 'EPSG:4326', 'EPSG:900913')

            // FIXME Layers should be an array, not an object
            for (let l in defn.json.layers) {
                layerObjs.push(defn.json.layers[l])
            }
        }

        const view = <olr.View zoom={zoom} center={center}/>

        return <olr.Map view={view}>
            <olr.layer.Tile>
                <olr.source.XYZ url={mapbox_url} />
            </olr.layer.Tile>
            <div style={{display: 'none'}}>
                {layerObjs.map((l: any) => {
                    return <LayerContainerWrapped key={l.hash} map={defn} layer={l}></LayerContainerWrapped>
                })}
            </div>
        </olr.Map>
    }
}

export default MapUI