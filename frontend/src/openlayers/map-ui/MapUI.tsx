import * as React from "react"
import LayerContainerWrapped from "../layer/LayerContainer"
import * as olr from "ol-react"
import * as ol from "openlayers"
import { IMap, ILayer, IPosition } from "../../redux/modules/interfaces"

export interface IProps {
    defn: IMap
    position: IPosition
    onSingleClick: Function
    onMoveEnd: Function
}

export class MapUI extends React.Component<IProps, {}> {
    render() {
        const { defn, position, onSingleClick, onMoveEnd } = this.props

        const mapbox_key =
            "pk.eyJ1Ijoia2VpdGhtb3NzIiwiYSI6IjkxMTViNjcxN2U5ZDBjMTYzYzY2MzQwNTJkZjM1NGFkIn0.HS40UI-OD5lQWBxUCZOwZg" // Where should this live?
        const mapbox_url = `https://api.mapbox.com/styles/v1/keithmoss/citje9al5004f2ipg4tc3neyi/tiles/256/{z}/{x}/{y}?access_token=${mapbox_key}`
        const mapbox_attribution =
            '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap contributors</a>'

        // FIXME Fix the map definitions
        if (defn !== undefined) {
            let zoom = defn.json.map_defaults.zoom || 4
            let center =
                ol.proj.transform(
                    [defn.json.map_defaults.lon, defn.json.map_defaults.lat],
                    "EPSG:4326",
                    "EPSG:900913"
                ) || ol.proj.transform([135, -27], "EPSG:4326", "EPSG:900913")
            const view = <olr.View minZoom={3} maxZoom={20} zoom={zoom} center={center} position={position} />

            return (
                <olr.Map view={view} onSingleClick={onSingleClick} onMoveEnd={onMoveEnd}>
                    <olr.control.FullScreen source={"ealgis"} />
                    <olr.control.Attribution />
                    <olr.layer.Tile>
                        <olr.source.XYZ url={mapbox_url} attributions={mapbox_attribution} />
                    </olr.layer.Tile>
                    <div>
                        {defn.json.layers.map((l: ILayer, key: number) => {
                            if ("latlon_bbox" in l) {
                                return <LayerContainerWrapped key={key} layerId={key} map={defn} layer={l} />
                            }
                        })}
                    </div>
                </olr.Map>
            )
        } else {
            let zoom = 4
            let center = ol.proj.transform([135, -27], "EPSG:4326", "EPSG:900913")
            const view = <olr.View minZoom={3} maxZoom={20} zoom={zoom} center={center} position={position} />

            return (
                <olr.Map view={view} onMoveEnd={onMoveEnd}>
                    <olr.control.Attribution />
                    <olr.layer.Tile>
                        <olr.source.XYZ url={mapbox_url} attributions={mapbox_attribution} />
                    </olr.layer.Tile>
                </olr.Map>
            )
        }
    }
}

export default MapUI
