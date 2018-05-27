import "whatwg-fetch"
import { IColourDefs } from "../../redux/modules/ealgis"
import { ILayer, IOLStyleDef } from "../../redux/modules/interfaces"
import { hsltorgb } from "../utils"
import Matrix from "./Matrix"

interface IOperator {
    attr: string
    op: string
    v: number
}

export class RGB {
    r: number
    g: number
    b: number

    constructor(r: number, g: number, b: number) {
        this.r = r
        this.g = g
        this.b = b
    }

    toString() {
        return `${this.r * 255},${this.g * 255},${this.b * 255}`
    }
}

export class ColourScale {
    interpolated: Array<RGB>
    nanno: number
    is_discrete: boolean
    scale_min?: number
    scale_max?: number
    nlevels: number
    to_scale?: Matrix
    normalise?: Matrix

    constructor(interpolated: Array<RGB>, nanno: number, is_discrete: boolean, scale_min: number = 0.0, scale_max: number = 1.0) {
        // colour scale @interpolated in [0, 1] normalised, regular.. first is for < scale_min, last is for >= scale_max
        this.interpolated = interpolated
        this.nlevels = this.interpolated.length
        this.nanno = nanno
        this.set_scale(scale_min, scale_max)
        this.is_discrete = is_discrete
    }

    static with_scale_or_flip(scale: ColourScale, scale_min: number, scale_max: number, scale_flip: boolean) {
        let new_interp = JSON.parse(JSON.stringify(scale.interpolated))
        if (scale_flip) {
            new_interp = new_interp.reverse()
        }

        return new ColourScale(new_interp, scale.nanno, scale.is_discrete, scale_min, scale_max)
    }

    set_scale(scale_min: number, scale_max: number) {
        this.scale_min = scale_min
        this.scale_max = scale_max

        // matrices to go in and out of that space
        this.to_scale = new Matrix()
        this.to_scale.translate(scale_min, 0)
        this.to_scale.scale(scale_max - scale_min, 1)

        this.normalise = new Matrix()
        // @ts-ignore
        this.normalise = this.normalise.setTransform(...this.to_scale.getMatrixValues())
        this.normalise = this.normalise.getInverse()
    }

    get_nlevels() {
        return this.nlevels
    }

    lookup(v: number, normalise: boolean = true) {
        // v -> [0, 1]
        let idx: number

        if (normalise) {
            v = this.normalise!.applyToPoint(v, 0).x
        }

        if (v < 0) {
            idx = 0
        } else if (v >= 1) {
            idx = this.nlevels - 1
        } else {
            // for the "inner" colour levels e.g. 5 levels, 3 "inner"
            idx = Math.floor(v * (this.nlevels - 2)) + 1
        }

        return this.interpolated[idx]
    }
}

// Not yet converted from Python - wasn't required
// export class ContinuousColourScale extends ColourScale {
//     constructor(defn: any, nlevels: any) {
//         super(ContinuousColourScale.interpolate_iter(defn, nlevels), defn.length, false)
//     }

//     static *interpolate_iter(defn: any, nlevels: any) {
//         let npairs = defn.length - 1
//         let nlevel_pair = nlevels // npairs
//         let nlevel_leftover = nlevels - nlevel_pair * npairs
//         // pair together the definition
//         // for idx, (c1, c2) in enumerate(pairwise(defn)):
//         for ([k, v] of pairwise(defn).entries()) {
//             // start at the start colour, end at the colour before the next colour level
//             // ... except at the last idx, where we must end at the end colour
//             ninc = n = nlevel_pair
//             if (idx == npairs - 1) {
//                 n += nlevel_leftover
//                 ninc = n - 1
//             }
//             let colour_inc = (c2 - c1) / float(ninc)
//             // for l in list(range(n)):
//             for (k in new Array(n)) {
//                 yield c1 + colour_inc * l
//             }
//         }
//     }
// }

export class DiscreteColourScale extends ColourScale {
    constructor(defn: Array<RGB>) {
        super(defn, defn.length, true)
    }
}

export class HLSDiscreteColourScale extends DiscreteColourScale {
    constructor(l: number, s: number, nlevels: number) {
        // circle is defined by [0, 1], eg. 0 and 1 are the same point. so opposites of a is a + 0.5
        let defn = []
        // use 2/3 of the circle, so end not too like start
        let h_inc = 2 / 3.0 / nlevels
        for (var i = 0; i < nlevels; i++) {
            let h = i * h_inc
            // @ts-ignore
            defn.push(new RGB(...hsltorgb(h, s, l)))
        }
        super(defn)
    }
}

function add_style_def(olStyle: Array<IOLStyleDef>, rgb: RGB, expr_from: IOperator | null, expr_to: IOperator | null, opacity: number) {
    let rgb_copy = JSON.parse(JSON.stringify(rgb))
    rgb_copy.r *= 255
    rgb_copy.g *= 255
    rgb_copy.b *= 255

    // # Ignore styles below 0 that shouldn't exist (?)
    if (expr_to !== null && expr_to["op"] === "<" && expr_to["v"] === 0) {
        return
    }

    let style: IOLStyleDef = {
        expr: {},
        rgb: [parseInt(rgb_copy.r), parseInt(rgb_copy.g), parseInt(rgb_copy.b)],
        opacity: opacity,
    }

    if (expr_from !== null) {
        style["expr"]["from"] = {
            attr: expr_from["attr"],
            op: expr_from["op"],
            v: expr_from["v"],
        }
    }

    if (expr_to !== null) {
        style["expr"]["to"] = {
            attr: expr_to["attr"],
            op: expr_to["op"],
            v: expr_to["v"],
        }
    }

    olStyle.push(style)
}

export function make_colour_scale(scale: ColourScale, attr: string = "q", cmin: number, cmax: number, opacity: number) {
    let olStyle: Array<IOLStyleDef> = []

    let inc
    if (scale.nlevels - 2 > 0) {
        inc = (cmax - cmin) / (scale.nlevels - 2)
    } else {
        inc = cmax - cmin
    }

    // below cmin
    add_style_def(olStyle, scale.lookup(cmin - inc), null, { attr: attr, op: "<", v: cmin }, opacity)

    // intermediate "within range" levels
    for (let idx = 1; idx < scale.nlevels - 1; idx++) {
        let vfrom = cmin + (idx - 1) * inc
        let vto = vfrom + inc

        // we hedge on any floating-point rounding issues with a have increment jump into our level
        // for the colour lookup
        add_style_def(
            olStyle,
            scale.lookup(vfrom + inc / 2.0),
            { attr: attr, op: ">=", v: vfrom },
            { attr: attr, op: "<", v: vto },
            opacity
        )
    }

    // above cmax
    if (scale.nlevels > 2) {
        add_style_def(olStyle, scale.lookup(cmax + inc), { attr: attr, op: ">=", v: cmax }, null, opacity)
    } else {
        // above cmin
        add_style_def(olStyle, scale.lookup(cmax + inc), { attr: attr, op: ">=", v: cmin }, null, opacity)
    }

    return olStyle
}

export function get_colour_scale_for_layer(layer: ILayer, colourdefs: IColourDefs) {
    let fill = layer["fill"]
    let scale_min = fill["scale_min"]
    let scale_max = fill["scale_max"]
    let scale_name = fill["scale_name"]
    let scale_nlevels = fill["scale_nlevels"]
    let scale_flip = fill["scale_flip"] !== undefined && fill["scale_flip"]

    return ColourScale.with_scale_or_flip(colourdefs[`${scale_name}.${scale_nlevels}`], scale_min, scale_max, scale_flip)
}

export function getLayerOLStyleDefinition(layer: ILayer, colourdefs: IColourDefs, attr: string = "q") {
    // Only layers with data expressions need colour scales created
    if (layer["fill"]["expression"] === "") {
        return undefined
    }

    // Just in case
    let cmin = layer.fill.scale_min
    let cmax = layer.fill.scale_max
    if (typeof cmin === "string") {
        cmin = parseFloat(cmin)
    }
    if (typeof cmax === "string") {
        cmax = parseFloat(cmax)
    }

    return make_colour_scale(get_colour_scale_for_layer(layer, colourdefs), attr, cmin, cmax, layer.fill.opacity)
}
