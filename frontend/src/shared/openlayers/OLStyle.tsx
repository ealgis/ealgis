import * as ol from "openlayers"

function getHighlightedFeaturePattern() {
    // Courtesy of http://openlayers.org/en/latest/examples/canvas-gradient-pattern.html
    var canvas = document.createElement("canvas")
    var context = canvas.getContext("2d")

    // Gradient and pattern are in canvas pixel space, so we adjust for the
    // renderer's pixel ratio
    var pixelRatio = ol.has.DEVICE_PIXEL_RATIO

    canvas.width = 11 * pixelRatio
    canvas.height = 11 * pixelRatio
    // white background
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
    // outer circle
    context.fillStyle = "rgba(102, 0, 102, 0.5)"
    context.beginPath()
    context.arc(5 * pixelRatio, 5 * pixelRatio, 4 * pixelRatio, 0, 2 * Math.PI)
    context.fill()
    // inner circle
    context.fillStyle = "rgb(55, 0, 170)"
    context.beginPath()
    context.arc(5 * pixelRatio, 5 * pixelRatio, 2 * pixelRatio, 0, 2 * Math.PI)
    context.fill()
    return context.createPattern(canvas, "repeat")
}

function createDebugFeatures(feature: any) {
    if (feature.get("label") !== undefined) {
        // Tile centroid point
        const stroke = new ol.style.Stroke({ color: "black", width: 2 })
        const fill = new ol.style.Fill({ color: "red" })

        return new ol.style.Style({
            text: new ol.style.Text({
                textAlign: "center",
                textBaseline: "middle",
                font: "20px Arial",
                text: feature.get("label"),
                stroke: new ol.style.Stroke({ color: "black", width: 2 }),
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
            }),
        })
    } else {
        // Tile border polygon
        return new ol.style.Style({
            fill: new ol.style.Fill({ color: "rgba(255, 255, 255, 0.4)" }),
            stroke: new ol.style.Stroke({
                color: "blue",
                width: 2,
            }),
        })
    }
}

export function compileLayerStyle(l: Object, debugMode: boolean, highlightedFeatures: Array<number>) {
    let styleCache: object = {}
    let do_fill = l["fill"]["expression"] != ""

    return (feature: Object, resolution: number) => {
        let q = feature.get("q")
        const isDebugFeature = debugMode === true && feature.get("debug") === true ? true : false

        if (isDebugFeature === true) {
            return createDebugFeatures(feature)
        } else {
            // START REGULAR FEATURES
            if (highlightedFeatures.indexOf(feature.get("gid")) >= 0) {
                let styleId = "_highlightedFeatures"
            } else if (do_fill) {
                let ruleId = l["olStyleDef"].findIndex((rule: object, key: number) => {
                    if (rule["expr"]["to"] === undefined) {
                        return true
                    } else if (q < rule["expr"]["to"]["v"]) {
                        return true
                    }
                })

                let styleId = `${l.hash}.${ruleId}`
            } else {
                let styleId = `${l.hash}`
            }

            if (styleCache[styleId] !== undefined) {
                // console.log(`Cache Hit for ${styleId}!`)
                return styleCache[styleId]
            }
            // console.log(`Cache Miss for ${styleId}!`)

            // Apply our special feature highlight pattern to these!
            if (highlightedFeatures.indexOf(feature.get("gid")) >= 0) {
                let olStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: getHighlightedFeaturePattern(),
                    }),
                })
            } else if (do_fill) {
                // Fill according to a set of user-defined styling rules
                let rule = l["olStyleDef"][ruleId]
                let rgb = rule["rgb"]

                if (rgb.length > 0) {
                    if (l["line"].width > 0) {
                        let olStyle = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${l.fill.opacity})`,
                            }),
                            stroke: new ol.style.Stroke({
                                color: `rgba(${l["line"].colour.r}, ${l["line"].colour.g}, ${l["line"].colour.b}, ${l[
                                    "line"
                                ].colour.a})`,
                                width: l["line"].width,
                            }),
                        })
                    } else {
                        let olStyle = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${l.fill.opacity})`,
                            }),
                        })
                    }
                }
            } else {
                // No fill - border style only
                let olStyle = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: `rgba(${l["line"].colour.r}, ${l["line"].colour.g}, ${l["line"].colour.b}, ${l["line"]
                            .colour.a})`,
                        width: l["line"].width,
                    }),
                })
            }

            styleCache[styleId] = olStyle
            return styleCache[styleId]
            // END REGULAR FEATURES
        }

        // If no style is returned OpenLayers will default to its inbuilt style,
        // so this isn't a catastrophic failure.
    }
}
