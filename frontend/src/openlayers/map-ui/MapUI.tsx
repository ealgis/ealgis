import olProj from "ol/proj"
import olOSM from "ol/source/osm"
import olSourceStamen from "ol/source/stamen"
import olSourceXYZ from "ol/source/xyz"
import * as React from "react"
import { Controls } from "react-openlayers/dist/controls/controls"
import { default as FullScreen } from "react-openlayers/dist/controls/full-screen"
import { Layers } from "react-openlayers/dist/layers/layers"
import { default as Tile } from "react-openlayers/dist/layers/tile"
import { Map } from "react-openlayers/dist/map"
import { IConfig } from "../../redux/modules/interfaces"
import { IPosition } from "../../redux/modules/map"
import { ILayer, IMap } from "../../redux/modules/maps"
import LayerContainerWrapped from "../layer/LayerContainer"
declare var Config: IConfig

export interface IProps {
    defn: IMap
    position: IPosition
    onSingleClick: Function
    onMoveEnd: Function
}

export class MapUI extends React.Component<IProps, {}> {
    basemapTileSource: any

    constructor(props: any) {
        super(props)
        if (Config["EALGIS_BASEMAP_PROVIDER"] === "MAPBOX") {
            this.basemapTileSource = new olSourceXYZ({
                url: `https://api.mapbox.com/styles/v1/keithmoss/citje9al5004f2ipg4tc3neyi/tiles/256/{z}/{x}/{y}?access_token=${Config["MAPBOX_API_KEY"]}`,
                crossOrigin: "anonymous",
                attributions: [
                    "Based on Australian Bureau of Statistics data<br />",
                    '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap contributors</a>',
                ],
            })
        } else if (Config["EALGIS_BASEMAP_PROVIDER"] === "OSM") {
            this.basemapTileSource = new olOSM({
                attributions: [
                    "Based on Australian Bureau of Statistics data<br />",
                    '© <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap contributors</a>',
                ],
            })
        } else if (Config["EALGIS_BASEMAP_PROVIDER"] === "THUNDERFOREST") {
            this.basemapTileSource = new olSourceXYZ({
                url: `https://tile.thunderforest.com/${Config["THUNDERFOREST_MAP_STYLE"]}/{z}/{x}/{y}.png?apikey=${Config["THUNDERFOREST_API_KEY"]}`,
                crossOrigin: "anonymous",
                attributions: [
                    "Based on Australian Bureau of Statistics data<br />",
                    'Maps © <a href="https://www.thunderforest.com">Thunderforest</a>, Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                ],
            })
        } else {
            this.basemapTileSource = new olSourceStamen({
                layer: "toner",
                // @ts-ignore
                attributions: [
                    "Based on Australian Bureau of Statistics data<br />",
                    'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
                ],
            })
        }
    }

    render() {
        const { defn, position, onSingleClick, onMoveEnd } = this.props

        // FIXME Fix the map definitions
        if (defn !== undefined) {
            let zoom = defn.json.map_defaults.zoom || 4
            let center =
                olProj.transform([defn.json.map_defaults.lon, defn.json.map_defaults.lat], "EPSG:4326", "EPSG:900913") ||
                olProj.transform([135, -27], "EPSG:4326", "EPSG:900913")
            const view = { minZoom: 3, maxZoom: 20, zoom: zoom, center: center, position: position }

            return (
                <div>
                    <Map view={view} onSingleclick={onSingleClick} onMoveend={onMoveEnd}>
                        <Controls>
                            <FullScreen source={"ealgis"} />
                        </Controls>
                        <Layers>
                            <Tile source={this.basemapTileSource} />
                            {defn.json.layers
                                .filter((layer: ILayer) => "latlon_bbox" in layer && layer["latlon_bbox"] !== null)
                                .map((l: ILayer, key: number) => (
                                    <LayerContainerWrapped key={`${key}.${l.hash}`} layerId={key} map={defn} layer={l} />
                                ))}
                        </Layers>
                    </Map>
                </div>
            )
        } else {
            let zoom = 4
            let center = olProj.transform([135, -27], "EPSG:4326", "EPSG:900913")
            const view = { minZoom: 3, maxZoom: 20, zoom: zoom, center: center, position: position }

            return (
                <div>
                    <Map view={view} onMoveend={onMoveEnd}>
                        <Controls>
                            <FullScreen source={"ealgis"} />
                        </Controls>
                        <Layers>
                            <Tile source={this.basemapTileSource} />
                        </Layers>
                    </Map>
                </div>
            )
        }
    }
}

export default MapUI
