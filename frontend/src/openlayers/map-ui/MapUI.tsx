import * as React from "react"
import LayerContainerWrapped from "../layer/LayerContainer"
// import * as olr from "ol-react"
// import {
//     //     // interaction,
//     layer as rolLayer,
//     //     // custom,
//     control, //name spaces
//     //     // Interactions,
//     //     // Overlays,
//     Controls, //group
//     Map,
//     Layers,
//     //     // Overlay,
//     //     // Util, //objects
// } from "react-openlayers"

import {
    interaction,
    layer,
    custom,
    control, //name spaces
    Interactions,
    Overlays,
    Controls, //group
    Map,
    Layers,
    Overlay,
    Util, //objects
} from "react-openlayers"

// import { Map } from "./r-o/map"
// import { Layers } from "./r-o/layers"
// import { default as Tile } from "./r-o/tile"
// import { Map } from "react-openlayers/map"
// import * as ol from "openlayers"
import olProj from "ol/proj"
import olProjection from "ol/proj/projection"
import olFormatGeoJSON from "ol/format/geojson"
import olSourceStamen from "ol/source/stamen"
import olSourceVectorTile from "ol/source/vectortile"
import olSourceXYZ from "ol/source/xyz"
import olTileGrid from "ol/tilegrid"
import olFormatMVT from "ol/format/mvt"
import { IConfig, IMap, ILayer, IPosition } from "../../redux/modules/interfaces"
const Config: IConfig = require("Config") as any

export interface IProps {
    defn: IMap
    position: IPosition
    onSingleClick: Function
    onMoveEnd: Function
}

export class MapUI extends React.Component<IProps, {}> {
    mapbox: any

    constructor(props: any) {
        super(props)
        this.mapbox = new olSourceXYZ({
            url: `https://api.mapbox.com/styles/v1/keithmoss/citje9al5004f2ipg4tc3neyi/tiles/256/{z}/{x}/{y}?access_token=${
                Config["MAPBOX_API_KEY"]
            }`,
            attributions:
                '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap contributors</a>',
        })
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
                    <Map view={{ center: [0, 0], zoom: 2 }}>
                        <Controls>
                            <control.FullScreen />
                        </Controls>
                        <Layers>
                            <layer.Tile source={new olSourceStamen({ layer: "watercolor" })} />
                            <layer.VectorTile
                                source={
                                    new olSourceVectorTile({
                                        projection: undefined,
                                        attributions:
                                            '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
                                            '© <a href="https://www.openstreetmap.org/copyright">' +
                                            "OpenStreetMap contributors</a>",
                                        format: new olFormatMVT(),
                                        tileGrid: olTileGrid.createXYZ({ maxZoom: 22 }),
                                        tilePixelRatio: 16,
                                        url:
                                            "https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/" +
                                            "{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYWxsZW5od2tpbSIsImEiOiJjajBlbzkzazYwMWh1Mndya3R2amw0ang1In0.QU0YtPQ0-IgHMLt574HGlw",
                                    })
                                }
                            />

                            {/* {defn.json.layers.filter((layer: ILayer) => "latlon_bbox" in layer).map((l: ILayer, key: number) => {
                                // return <rolLayer.Tile key={key} source={new olSourceStamen({ layer: "watercolor" })} />

                                return (
                                    <rolLayer.VectorTile
                                        key={key}
                                        source={
                                            new olSourceVectorTile({
                                                projection: undefined,
                                                attributions:
                                                    '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
                                                    '© <a href="https://www.openstreetmap.org/copyright">' +
                                                    "OpenStreetMap contributors</a>",
                                                format: new olFormatMVT(),
                                                tileGrid: olTileGrid.createXYZ({ maxZoom: 22 }),
                                                tilePixelRatio: 16,
                                                url:
                                                    "https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/" +
                                                    "{z}/{x}/{y}.vector.pbf?access_token=" +
                                                    Config["MAPBOX_API_KEY"],
                                            })
                                        }
                                    />
                                )

                                // if ("latlon_bbox" in l) {
                                // return <LayerContainerWrapped key={key} layerId={key} map={defn} layer={l} />
                                // return <layer.Tile />
                                // }
                            })} */}
                        </Layers>
                    </Map>
                </div>
            )

            // return (
            //     <olr.Map view={view} onSingleClick={onSingleClick} onMoveEnd={onMoveEnd}>
            //         <olr.control.FullScreen source={"ealgis"} />
            //         <olr.control.Attribution />
            //         <olr.layer.Tile>
            //             <olr.source.XYZ url={mapbox_url} attributions={mapbox_attribution} />
            //         </olr.layer.Tile>
            //         <div>
            //             {defn.json.layers.map((l: ILayer, key: number) => {
            //                 if ("latlon_bbox" in l) {
            //                     return <LayerContainerWrapped key={key} layerId={key} map={defn} layer={l} />
            //                 }
            //             })}
            //         </div>
            //     </olr.Map>
            // )
        } else {
            let zoom = 4
            let center = olProj.transform([135, -27], "EPSG:4326", "EPSG:900913")
            const view = { minZoom: 3, maxZoom: 20, zoom: zoom, center: center, position: position }

            return (
                <div>
                    <Map view={view} onMoveEnd={onMoveEnd}>
                        {/* <olr.control.Attribution />
                    <olr.layer.Tile>
                        <olr.source.XYZ url={mapbox_url} attributions={mapbox_attribution} />
                    </olr.layer.Tile> */}
                    </Map>
                </div>
            )
        }
    }
}

export default MapUI
