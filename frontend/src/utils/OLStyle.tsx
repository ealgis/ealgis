import * as ol from 'openlayers';

export function compileLayerStyle(l: Object, debugMode: boolean) {
    let fill = l['fill']
    let line = l['line']
    
    let do_fill = (fill['expression'] != '')
    if(do_fill) {
        let scale_min = parseFloat(fill['scale_min'])
        let scale_max = parseFloat(fill['scale_max'])
        let opacity = parseFloat(fill['opacity'])
        let styleCache = {}

        // return new ol.style.Style({
        //     fill: new ol.style.Fill({
        //         color: "#A2E619"
        //     }),
        //     stroke: new ol.style.Stroke({
        //         color: "#A2E619",
        //         width: 1
        //     })
        // });

        return (feature: Object, resolution: number) => {
            let q = feature.get("q");
            const isDebugFeature = (debugMode === true && feature.get("debug") === true) ? true : false

            if(isDebugFeature === true) {
                // START DEBUG FEATURES
                if(feature.get("label") !== undefined) {
                    // Tile centroid point
                    const stroke = new ol.style.Stroke({color: 'black', width: 2});
                    const fill = new ol.style.Fill({color: 'red'});

                    return new ol.style.Style({
                        text: new ol.style.Text({
                            textAlign: "center",
                            textBaseline: "middle",
                            font: "20px Arial",
                            text: feature.get("label"),
                            stroke: new ol.style.Stroke({color: "black", width: 2}),
                            offsetX: 0,
                            offsetY: 0,
                            rotation: 0
                        })
                    })

                } else {
                    // Tile border polygon
                    return new ol.style.Style({
                        fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.4)'}),
                        stroke: new ol.style.Stroke({
                            color: "blue",
                            width: 2
                        }),
                    })
                }
                // END DEBUG FEATURES

            } else {
                // START REGULAR FEATURES
                let styleId = `${l.hash}.${q.toFixed(2)}`

                if(styleCache[styleId] !== undefined) {
                    // console.log(`Cache Hit for ${styleId}!`)
                    return styleCache[styleId]
                }
                // console.log(`Cache Miss for ${styleId}!`)

                let rgb = []
                for(let rule of l["olStyleDef"]) {
                    if(q >= rule["expr"]["from"]["v"]) {
                        if(rule["expr"]["to"] === undefined) {
                            rgb = rule["rgb"]
                            break
                        } else if(q < rule["expr"]["to"]["v"]) {
                            rgb = rule["rgb"]
                            break
                        }
                    }
                }
                // console.log("q=", q, "from=", rule["expr"]["from"]["v"], (rule["expr"]["to"] !== undefined) ? "to= " + rule["expr"]["to"]["v"] : "")

                if(rgb.length > 0) {
                    if(line.width > 0) {
                        let olStyle = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                            }),
                            stroke: new ol.style.Stroke({
                                color: `rgba(${line.colour.r}, ${line.colour.g}, ${line.colour.b}, ${line.colour.a})`,
                                width: line.width,
                            }),
                        });

                    } else {
                        let olStyle = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                            }),
                        });
                    }
                }

                styleCache[styleId] = olStyle
                return styleCache[styleId]
                // END REGULAR FEATURES
            }

            // If no style is returned OpenLayers will default to its inbuilt style, 
            // so this isn't a catastrophic failure.
        }
        
    } else {
        // No fill
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: `rgba(${line.colour.r}, ${line.colour.g}, ${line.colour.b}, ${line.colour.a})`,
                width: line.width,
            })
        });
    }
}