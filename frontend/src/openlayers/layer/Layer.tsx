import olFormatGeoJSON from "ol/format/geojson"
import olFormatMVT from "ol/format/mvt"
import olProj from "ol/proj"
import olSourceVectorTile from "ol/source/vectortile"
import olTileGrid from "ol/tilegrid"
import TileGrid from "ol/tilegrid/tilegrid"
import * as React from "react"
import { default as VectorTile } from "react-openlayers/dist/layers/vector-tile"
import { IConfig } from "../../redux/modules/interfaces"
import { IMap, ILayer } from "../../redux/modules/maps";
declare var Config: IConfig

export interface IProps {
    map: IMap
    layer: ILayer
    layerId: number
    debugMode: boolean
}

export class Layer extends React.Component<IProps, {}> {
    source: any
    extent: any

    constructor(props: IProps) {
        super(props)
        const { map, layer } = this.props

        // Utilise the overzooming capabilities of OpenLayers and our MapBox Vector Tiles
        // Only request tiles from the backend for every second zoom level, and avoid requesting
        // any tiles once we reached level 15 (full detail baked into each tile)
        // Ref. https://github.com/openlayers/openlayers/issues/6942
        // c.f. http://openlayers.org/en/latest/examples/mapbox-vector-tiles-advanced.html

        // Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
        var resolutions = []
        for (var i = 0; i <= 8; ++i) {
            resolutions.push(156543.03392804097 / Math.pow(2, i * 2))
        }

        // Calculation of tile urls for zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
        function tileUrlFunction(tileCoord: any) {
            const url = "/api/0.1/maps/" + map.id + "/tile.json?layer=" + layer.hash + "&z={z}&x={x}&y={y}"
            return url
                .replace("{z}", String(tileCoord[0] * 2 - 1))
                .replace("{x}", String(tileCoord[1]))
                .replace("{y}", String(-tileCoord[2] - 1))
        }

        this.source = new olSourceVectorTile({
            tileGrid: new TileGrid({
                extent: olProj.get("EPSG:3857").getExtent(),
                resolutions: resolutions,
                tileSize: 512,
            }),
            tileUrlFunction: tileUrlFunction,
            format: new olFormatMVT(),
            overlaps: false,
            cacheSize: 256,
        })

        this.extent = olProj.transformExtent(
            [layer.latlon_bbox!.minx, layer.latlon_bbox!.miny, layer.latlon_bbox!.maxx, layer.latlon_bbox!.maxy],
            "EPSG:4326",
            "EPSG:900913"
        )
    }

    render() {
        const { map, layer, layerId } = this.props

        return (
            <VectorTile
                visible={layer.visible}
                extent={this.extent}
                style={layer.olStyle}
                renderMode={"hybrid"}
                properties={{
                    mapId: map.id,
                    layerId: layerId,
                }}
                source={this.source}
                zIndex={1}
            />
        )
    }
}

export default Layer
