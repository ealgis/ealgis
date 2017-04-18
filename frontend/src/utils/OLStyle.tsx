import * as ol from 'openlayers';
import Promise from 'promise-polyfill'
import 'whatwg-fetch'

export function compileLayerStyle(l: Object) {
    let fill = l['fill']
    let line = l['line']
    
    let do_fill = (fill['expression'] != '')
    if(do_fill) {
        let scale_min = parseFloat(fill['scale_min'])
        let scale_max = parseFloat(fill['scale_max'])
        let opacity = parseFloat(fill['opacity'])
        let styleCache = {}
        // make_colour_scale(l, 'q', parseFloat(scale_min), parseFloat(scale_max), opacity)

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
            let qRounded = q.toFixed(2)
            let styleId = `${l.id}.${qRounded}`
            
            if(styleCache[styleId] !== undefined) {
                // console.log("Cache Hit!")
                return styleCache[styleId]
            }
            // console.log("Cache Miss!")

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
                    const olStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`,
                        }),
                        stroke: new ol.style.Stroke({
                            color: `rgba(${line.colour.r},${line.colour.g},${line.colour.b},${line.colour.a})`,
                            width: line.width
                        }),
                    });

                } else {
                    const olStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`,
                        })
                    });
                }

                styleCache[styleId] = olStyle
                return styleCache[styleId]
            }

            // If no style is returned OpenLayers will default to its inbuilt style, 
            // so this isn't a catastrophic failure.
        }
        
    } else {
        // No fill
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: `rgba(${line.colour.r},${line.colour.g},${line.colour.b},${line.colour.a})`,
                width: line.width
            })
        });
    }
}