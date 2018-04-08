import olFormatGeoJSON from "ol/format/geojson"
import olProj from "ol/proj"
import olSourceVectorTile from "ol/source/vectortile"
import olTileGrid from "ol/tilegrid"
import * as React from "react"
import { default as VectorTile } from "react-openlayers/dist/layers/vector-tile"
import { IConfig, ILayer, IMap } from "../../redux/modules/interfaces"
const Config: IConfig = require("Config") as any

export interface IProps {
    map: IMap
    layer: ILayer
    layerId: number
    debugMode: boolean
}

export class Layer extends React.Component<IProps, {}> {
    render() {
        const { map, layer, layerId, debugMode } = this.props

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
        const bbox = layer.latlon_bbox
        const extent = olProj.transformExtent([bbox!.minx, bbox!.miny, bbox!.maxx, bbox!.maxy], "EPSG:4326", "EPSG:900913")
        const renderMode = "hybrid"
        const layerPropreties = {
            mapId: map.id,
            layerId: layerId,
        }

        const projection_epsg_no = "900913"
        const format = "geojson"
        let url = "/api/0.1/maps/" + map.id + "/tiles.json?layer=" + layer.hash + "&z={z}&x={x}&y={y}&format=" + format
        if (debugMode === true) {
            url = url + "&debug=1"
        }
        const formatObj = new olFormatGeoJSON()
        const tileGrid = olTileGrid.createXYZ({ maxZoom: 20 })
        const overlaps = true
        const cacheSize = 256
        const visible = layer.visible

        const source = new olSourceVectorTile({
            projection: undefined,
            url: url,
            format: formatObj,
            overlaps: overlaps,
            cacheSize: cacheSize,
        })

        /*
        // Matrix.default()

        // let scale_min = 0.0
        // let scale_max = 30.0

        // let to_scale = Matrix
        // to_scale.translate(scale_min, 0)
        // to_scale.scale(scale_max - scale_min, 1)
        // console.log("to_scale", ...to_scale.getMatrixValues())

        // let normalise = Matrix
        // normalise = normalise.setTransform(...to_scale.getMatrixValues())
        // normalise = normalise.getInverse()
        // console.log("normalise", ...normalise.getMatrixValues())

        // let v = -7.5
        // v = normalise.applyToPoint(v, 0)
        // console.log("v", v)


        var styleConfig = [{
            name: "red",
            colour: "#E61919"
        },{
            name: "orange",
            colour: "#E6A219"
        },{
            name: "green",
            colour: "#A2E619"
        },{
            name: "light_green",
            colour: "#19E619"
        },{
            name: "aqua_green",
            colour: "#19E6A2"
        },{
            name: "blue",
            colour: "#19A2E6"
        }]

        var styles: Array<ol.style.Style> = [];
        for(var i = 0; i < styleConfig.length; i++) {
            var style = styleConfig[i];

            styles[style["name"]] = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: style["colour"]
                }),
                stroke: new ol.style.Stroke({
                    color: style["colour"],
                    width: 1
                })
            });
        }

        function simpleStyle(feature: any, resolution: number) {
            let q: Object = feature.get("q");
            
            if(q < 0) {
                return styles["red"];
            } else if(q < 7.5) {
                return styles["orange"];
            } else if(q < 15) {
                return styles["green"];
            } else if(q < 22.5) {
                return styles["light_green"];
            } else if(q < 30) {
                return styles["aqua_green"];
            } else {
                return styles["blue"];
            }
        }*/

        return (
            <VectorTile
                visible={visible}
                extent={extent}
                style={layer.olStyle}
                renderMode={renderMode}
                properties={layerPropreties}
                source={source}
                zIndex={1}
            />
        )
    }
}

export default Layer
