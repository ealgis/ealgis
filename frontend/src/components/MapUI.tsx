import * as React from "react";
import LayerContainerWrapped from './LayerContainer';
import * as olr from 'ol-react';
import * as ol from 'openlayers';

export interface MapUIProps {
    defn: any,
    onSelect: Function,
    onNavigation: Function,
    allowMapViewSetting: boolean,
}

export class MapUI extends React.Component<MapUIProps, undefined> {
    render() {
        const { defn, onSelect, onNavigation, allowMapViewSetting } = this.props

        const mapbox_key = "pk.eyJ1Ijoia2VpdGhtb3NzIiwiYSI6IjkxMTViNjcxN2U5ZDBjMTYzYzY2MzQwNTJkZjM1NGFkIn0.HS40UI-OD5lQWBxUCZOwZg" // Where should this live?
        const mapbox_url = `https://api.mapbox.com/styles/v1/keithmoss/citje9al5004f2ipg4tc3neyi/tiles/256/{z}/{x}/{y}?access_token=${mapbox_key}`

        // FIXME Fix the map definitions
        if(defn !== undefined) {
            let zoom = parseInt(defn.json.map_defaults.zoom) || 4
            let center = ol.proj.transform([parseFloat(defn.json.map_defaults.lon), parseFloat(defn.json.map_defaults.lat)], 'EPSG:4326', 'EPSG:900913') || ol.proj.transform([135, -27], 'EPSG:4326', 'EPSG:900913')
            const view = <olr.View zoom={zoom} center={center} onNavigation={onNavigation} allowMapViewSetting={allowMapViewSetting} />
            
            return <olr.Map view={view}>
                <olr.interaction.Select select={onSelect} />
                <olr.layer.Tile>
                    <olr.source.XYZ url={mapbox_url} />
                </olr.layer.Tile>
                <div>
                    {defn.json.layers.map((l: any, key: number) => {
                        return <LayerContainerWrapped key={key} layerId={key} map={defn} layer={l} />
                    })}
                </div>
            </olr.Map>

        } else {
            let zoom = 4
            let center = ol.proj.transform([135, -27], 'EPSG:4326', 'EPSG:900913')
            const view = <olr.View zoom={zoom} center={center} onNavigation={onNavigation} />

            return <olr.Map view={view}>
                <olr.layer.Tile>
                    <olr.source.XYZ url={mapbox_url} />
                </olr.layer.Tile>
            </olr.Map>
        }
    }
}

export default MapUI