import { sortedIndex } from "lodash-es"
import { eval as mathjsEval } from "mathjs"
// @ts-ignore
import has from "ol/has"
import olStyleFill from "ol/style/fill"
import olStyleStroke from "ol/style/stroke"
import olStyleStyle from "ol/style/style"
import olStyleText from "ol/style/text"
import { ILayer, IOLFeatureProps, IOLStyleDef, IOLStyleDefExpression } from "../../redux/modules/interfaces"
import { eLayerTypeOfData } from "../../redux/modules/maps"

// These enum values must be unique and designed not to clash with the output of getRuleId()
enum eStyleType {
    HIGHLIGHTED_FEATURE = "_HIGHLIGHTED_FEATURE",
    ERROR = "_ERROR", // In what circumstances does this occur again?
    NO_DATA = "_NO_DATA",
}

function getHighlightedFeaturePattern() {
    // Courtesy of http://openlayers.org/en/latest/examples/canvas-gradient-pattern.html
    var canvas = document.createElement("canvas")
    var context = canvas.getContext("2d") as CanvasRenderingContext2D

    // Gradient and pattern are in canvas pixel space, so we adjust for the
    // renderer's pixel ratio
    canvas.width = 11 * has.DEVICE_PIXEL_RATIO
    canvas.height = 11 * has.DEVICE_PIXEL_RATIO

    // white background
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
    // outer circle
    context.fillStyle = "rgba(102, 0, 102, 0.5)"
    context.beginPath()
    context.arc(5 * has.DEVICE_PIXEL_RATIO, 5 * has.DEVICE_PIXEL_RATIO, 4 * has.DEVICE_PIXEL_RATIO, 0, 2 * Math.PI)
    context.fill()
    // inner circle
    context.fillStyle = "rgb(55, 0, 170)"
    context.beginPath()
    context.arc(5 * has.DEVICE_PIXEL_RATIO, 5 * has.DEVICE_PIXEL_RATIO, 2 * has.DEVICE_PIXEL_RATIO, 0, 2 * Math.PI)
    context.fill()
    return context.createPattern(canvas, "repeat")
}

function getErrorStylePattern() {
    // Courtesy of https://stackoverflow.com/a/32206237
    var canvas = document.createElement("canvas")
    var context = canvas.getContext("2d") as CanvasRenderingContext2D

    var p = document.createElement("canvas")
    p.width = 32
    p.height = 16
    var pctx = p.getContext("2d") as CanvasRenderingContext2D

    var x0 = 36
    var x1 = -4
    var y0 = -2
    var y1 = 18
    var offset = 32

    pctx.strokeStyle = "#FF0000"
    pctx.lineWidth = 2
    pctx.beginPath()
    pctx.moveTo(x0, y0)
    pctx.lineTo(x1, y1)
    pctx.moveTo(x0 - offset, y0)
    pctx.lineTo(x1 - offset, y1)
    pctx.moveTo(x0 + offset, y0)
    pctx.lineTo(x1 + offset, y1)
    pctx.stroke()

    // @ts-ignore
    context.fillStyle = pctx.createPattern(p, "repeat")
    context.fillRect(0, 0, canvas.width, canvas.height)

    return context.createPattern(canvas, "repeat")
}

function createDebugFeatures(feature: any) {
    if (feature.get("label") !== undefined) {
        // Tile centroid point
        const stroke = new olStyleStroke({ color: "black", width: 2 })
        const fill = new olStyleFill({ color: "red" })

        return new olStyleStyle({
            text: new olStyleText({
                textAlign: "center",
                textBaseline: "middle",
                font: "20px Arial",
                text: feature.get("label"),
                stroke: new olStyleStroke({ color: "black", width: 2 }),
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
            }),
        })
    } else {
        // Tile border polygon
        return new olStyleStyle({
            fill: new olStyleFill({ color: "rgba(255, 255, 255, 0.4)" }),
            stroke: new olStyleStroke({
                color: "blue",
                width: 2,
            }),
        })
    }
}

export function getRuleId(q: number, layer: ILayer, styleClassValueRange: Array<number>) {
    if (layer["type_of_data"] === eLayerTypeOfData.DISCRETE) {
        if (q === undefined) {
            return eStyleType.NO_DATA
        }
        return sortedIndex(styleClassValueRange, q)
    }

    // Use a binary search to grab the index that our "q" value is closest to
    let ruleId = sortedIndex(styleClassValueRange, q)
    let rule = layer["olStyleDef"]![ruleId]
    const expressionToString = (e: IOLStyleDefExpression, q: number) => `${q} ${e["op"]} ${e["v"]}`

    // Handle cases where the "q" value falls directly on the edge
    // between two style classes and we need to use next ruleId.
    // For future-proofing we'll evaluate the actual expressions provided.
    if ("to" in rule["expr"] && "from" in rule["expr"]) {
        // Range [25, 50, 75, 100]
        // e.g. "q" is 50. Our ruleId is "1", but we actually need to use the next rule (50 - 75 range).
        // e.g. "q" is 100. Our ruleId is "3", but we actually need to use the last rule (100+)
        if (
            mathjsEval(expressionToString(rule["expr"]["to"]!, q)) === false &&
            mathjsEval(expressionToString(rule["expr"]["from"]!, q)) === true
        ) {
            ruleId += 1
        }
    } else if ("to" in rule["expr"]) {
        // Range [25, 50, 75, 100]
        // e.g. "q" is 25. Our ruleId is "0", but we actually need to use the next rule (25 - 50 range).
        if (mathjsEval(expressionToString(rule["expr"]["to"]!, q)) === false) {
            ruleId += 1
        }
    }

    if (ruleId === -1) {
        return eStyleType.ERROR
    }

    return ruleId
}

export function compileLayerStyle(l: ILayer, layerId: number, debugMode: boolean, highlightedFeatures: Array<number>) {
    // layerStyleIdCache contains layerId => styleId mappings
    // "layerId.ruleId" (fill styles - e.g. with data expressions defined)
    // "layerId" (non-fill styles - e.g. boundaries only, with no data expression)

    let styleCache: any = {
        [eStyleType.HIGHLIGHTED_FEATURE]: new olStyleStyle({
            fill: new olStyleFill({
                color: getHighlightedFeaturePattern() as any,
            }),
        }),
        [eStyleType.ERROR]: new olStyleStyle({
            fill: new olStyleFill({
                color: getErrorStylePattern() as any,
            }),
        }),
        [eStyleType.NO_DATA]: undefined,
    }
    let layerStyleIdCache: any = {}
    let do_fill = l["fill"]["expression"] !== "" && l["type_of_data"] !== eLayerTypeOfData.NOT_SET

    // styleClassValueRange is an array of the "to" values ("v") for each style class
    // in this layer. It lets us quickly lookup the index of that a given
    // "q" value should be using using a binary search in getRuleId()
    let styleClassValueRange: Array<number>
    if (l["olStyleDef"] !== undefined) {
        // @ts-ignore
        styleClassValueRange = l["olStyleDef"]!.map((o: IOLStyleDef) => ("to" in o["expr"] ? o["expr"]["to"]!["v"] : undefined)).filter(
            (o: number | undefined) => o !== undefined
        )
    }

    return (feature: IOLFeatureProps, resolution: number) => {
        let q = feature.get("q")
        let gid = feature.get("gid")
        let layerUID = `${layerId}.${gid}`
        const isDebugFeature = debugMode === true && feature.get("debug") === true ? true : false

        if (isDebugFeature === true) {
            return createDebugFeatures(feature)
        } else {
            let styleId: any = null
            let ruleId: any = null
            let olStyle: any = null

            // Apply our special feature highlight pattern to this feature
            if (highlightedFeatures.indexOf(gid) >= 0) {
                return styleCache[eStyleType.HIGHLIGHTED_FEATURE]
            } else if (layerUID in layerStyleIdCache && layerStyleIdCache[layerUID] !== undefined) {
                styleId = layerStyleIdCache[layerUID]
            } else {
                if (do_fill) {
                    ruleId = getRuleId(q, l, styleClassValueRange)

                    if (ruleId === eStyleType.ERROR) {
                        return styleCache[eStyleType.ERROR]
                    } else if (ruleId === eStyleType.NO_DATA) {
                        return styleCache[eStyleType.NO_DATA]
                    }

                    styleId = `${l.hash}.${ruleId}`
                } else {
                    styleId = `${l.hash}`
                }
            }

            if (styleId !== null && styleCache[styleId] !== undefined) {
                // console.log(`Cache Hit for ${styleId}`)
                layerStyleIdCache[layerUID] = styleId
                return styleCache[styleId]
            }
            // console.log(`Cache Miss for ${styleId}!`)

            if (do_fill) {
                // Fill according to a set of user-defined styling rules
                let rule = l["olStyleDef"]![ruleId]
                let rgb = rule["rgb"]

                if (rgb.length > 0) {
                    if (l["line"].width > 0) {
                        olStyle = new olStyleStyle({
                            fill: new olStyleFill({
                                color: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${l.fill.opacity})`,
                            }),
                            stroke: new olStyleStroke({
                                color: `rgba(${l["line"].colour.r}, ${l["line"].colour.g}, ${l["line"].colour.b}, ${l["line"].colour.a})`,
                                width: l["line"].width,
                            }),
                        })
                    } else {
                        olStyle = new olStyleStyle({
                            fill: new olStyleFill({
                                color: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${l.fill.opacity})`,
                            }),
                        })
                    }
                }
            } else {
                // No fill - border style only
                olStyle = new olStyleStyle({
                    stroke: new olStyleStroke({
                        color: `rgba(${l["line"].colour.r}, ${l["line"].colour.g}, ${l["line"].colour.b}, ${l["line"].colour.a})`,
                        width: l["line"].width,
                    }),
                })
            }

            styleCache[styleId] = olStyle
            layerStyleIdCache[layerUID] = styleId
            return styleCache[styleId]
        }

        // If no style is returned OpenLayers will default to its inbuilt style,
        // so this isn't a catastrophic failure.
    }
}
