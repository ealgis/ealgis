import * as ol from "openlayers"
import * as Matrix from "../utils/Matrix"
import Promise from "promise-polyfill"
import "whatwg-fetch"

// RGBBase = namedtuple('RGB', ['r', 'g', 'b'])

export class RGB {
    r: any
    g: any
    b: any

    constructor(r: any, g: any, b: any) {
        this.r = r
        this.g = g
        this.b = b
    }

    // __mul__(s) {
    //     return {this.r * s, this.g * s, this.b * s}
    // }

    // __div__(s) {
    //     return {this.r / s, this.g / s, this.b / s}
    // }

    // __sub__(rgb) {
    //     return {this.r - rgb.r, this.g - rgb.g, this.b - rgb.b}
    // }

    // __add__(rgb) {
    //     return {this.r + rgb.r, this.g + rgb.g, this.b + rgb.b}
    // }
}

export class ColourScale {
    interpolated: any
    nanno: any
    is_discrete: any
    scale_min: any
    scale_max: any
    nlevels: any
    to_scale: any
    normalise: any

    constructor(interpolated: any, nanno: any, is_discrete: any, scale_min: number = 0, scale_max: number = 1) {
        console.log("constructor")
        console.log("this", this)
        console.log("interpolated", interpolated)

        // colour scale @interpolated in [0, 1] normalised, regular.. first is for < scale_min, last is for >= scale_max
        // ColourScale.init(...arguments)

        this.interpolated = interpolated
        this.nlevels = this.interpolated.length
        this.nanno = nanno
        this.set_scale(scale_min, scale_max)
        this.is_discrete = is_discrete
    }

    // init(interpolated: any, nanno: any, is_discrete: any, scale_min: number = 0., scale_max: number = 1.) {
    //     console.log("init")
    //     console.log("this", this)
    //     // colour scale @interpolated in [0, 1] normalised, regular.. first is for < scale_min, last is for >= scale_max
    //     this.interpolated = interpolated
    //     this.nlevels = this.interpolated.length
    //     this.nanno = nanno
    //     this.set_scale(scale_min, scale_max)
    //     this.is_discrete = is_discrete
    // }

    // init(source: any) {
    //     CopyProperties(source, this)
    // }

    static with_scale_or_flip(scale: any, scale_min: any, scale_max: any, scale_flip: any) {
        let new_interp = scale.interpolated + []
        if (scale_flip) {
            new_interp = new_interp.reverse()
        }

        let new_scale = new ColourScale(new_interp, scale.nanno, scale.is_discrete, scale_min, scale_max)
        return new_scale
    }

    set_scale(scale_min: any, scale_max: any) {
        this.scale_min = parseFloat(scale_min)
        this.scale_max = parseFloat(scale_max)

        // matrices to go in and out of that space
        Matrix.default()
        this.to_scale = Matrix
        this.to_scale.translate(scale_min, 0)
        this.to_scale.scale(scale_max - scale_min, 1)

        this.normalise = Matrix
        this.normalise = this.normalise.setTransform(...this.to_scale.getMatrixValues())
        this.normalise = this.normalise.getInverse()
    }

    get_nlevels() {
        return this.nlevels
    }

    lookup(v: any, normalise: boolean = true) {
        // v -> [0, 1]
        console.log("v", v)
        if (normalise) v = this.normalise.applyToPoint(v, 0).x
        console.log("v", v)
        let idx: number
        if (v < 0) idx = 0
        else if (v >= 1) idx = this.nlevels - 1
        else idx = v * (this.nlevels - 2) + 1 // eg. 5 levels, 3 "inner"
        console.log("idx", idx)
        return this.interpolated[idx]
    }
}

export class ContinuousColourScale extends ColourScale {
    constructor(defn: any, nlevels: any) {
        super(ContinuousColourScale, this).__init__(
            ContinuousColourScale.interpolate_iter(defn, nlevels),
            defn.length,
            false
        )
    }

    static *interpolate_iter(defn: any, nlevels: any) {
        let npairs = len(defn) - 1
        let nlevel_pair = nlevels // npairs
        let nlevel_leftover = nlevels - nlevel_pair * npairs
        // pair together the definition
        // for idx, (c1, c2) in enumerate(pairwise(defn)):
        for ([k, v] of pairwise(defn).entries()) {
            // start at the start colour, end at the colour before the next colour level
            // ... except at the last idx, where we must end at the end colour
            ninc = n = nlevel_pair
            if (idx == npairs - 1) {
                n += nlevel_leftover
                ninc = n - 1
            }
            let colour_inc = (c2 - c1) / float(ninc)
            // for l in list(range(n)):
            for (k in new Array(n)) {
                yield c1 + colour_inc * l
            }
        }
    }
}

class DiscreteColourScale extends ColourScale {
    constructor(defn: any) {
        super(defn, defn.length, true)
        console.log("super.init", super.init)
        super.init(defn, defn.length, true)
        // super(DiscreteColourScale, this).__init__(
        //     defn,
        //     defn.length,
        //     true)
    }
}

class HLSDiscreteColourScale extends DiscreteColourScale {
    // http://stackoverflow.com/questions/16793503/initializing-typescript-class-values-from-constructor
    // http://stackoverflow.com/questions/23791513/call-method-from-constructor-error-uncaught-typeerror-undefined-is-not-a-func
    // https://weblogs.asp.net/dwahlin/extending-classes-and-interfaces-using-typescript
    constructor(ls: any, nlevels: any) {
        let { l, s } = ls
        // circle is defined by [0, 1], eg. 0 and 1 are the same point. so opposites of a is a + 0.5
        let defn = []
        // use 2/3 of the circle, so end not too like start
        let h_inc = 2 / 3 / nlevels
        // for i in list(range(nlevels)):
        for (i in new Array(nlevels)) {
            h = i * h_inc
            // defn.append(RGB(*colorsys.hls_to_rgb(h, l, s)))
            defn.append(RGB(...hslToRgb(h, l, s)))
        }
        super(defn)
        // super(HLSDiscreteColourScale, this).__init__(defn)
    }
}

export class CannedColourDefinitions {
    defs: any

    constructor() {
        this.defs = {}
        this.huey()
        // this.color_brewer()
    }

    // def get_json(self):
    //     r = {}
    //     for name, nlevels in self.defs:
    //         if name not in r:
    //             r[name] = {}
    //         r[name][nlevels] = self.get(name, nlevels).interpolated
    //     return r

    register(name: any, defn: any) {
        this.defs[(name, defn.get_nlevels())] = defn
    }

    huey() {
        // for i in list(range(2, 13)):
        for (var i = 2; i <= 13; i++) {
            this.register("Huey", HLSDiscreteColourScale((0.5, 0.8), i))
        }
    }

    get(name: any, nlevels: any) {
        return this.defs[(name, nlevels)]
    }

    // color_brewer(self) {
    //     def strip_bl(r):
    //         return [t for t in r if t != '']

    //     with open('/app/contrib/colorbrewer/ColorBrewer_all_schemes_RGBonly3.csv') as fd:
    //         rdr = csv.reader(fd)
    //         header = strip_bl(next(rdr))

    //         def make_getter(nm, f=str):
    //             idx = header.index(nm)

    //             def __getter(row):
    //                 return f(row[idx])

    //             return __getter

    //         color_name = make_getter('ColorName')
    //         num_of_colours = make_getter('NumOfColors', int)
    //         r = make_getter('R', lambda v: int(v) / 255.)
    //         g = make_getter('G', lambda v: int(v) / 255.)
    //         b = make_getter('B', lambda v: int(v) / 255.)
    //         for row in rdr:
    //             name = color_name(row)
    //             if name == '':
    //                 break
    //             nc = num_of_colours(row)
    //             colours = []
    //             colours.append(RGB(r(row), g(row), b(row)))
    //             for i in list(range(nc - 1)):
    //                 row = next(rdr)
    //                 colours.append(RGB(r(row), g(row), b(row)))
    //             self.register(name, DiscreteColourScale(colours))
    // }
}

// let definitions = new CannedColourDefinitions()

let huey6 = [
    [0.9, 0.09999999999999998, 0.09999999999999998],
    [0.9, 0.6333333333333333, 0.09999999999999998],
    [0.6333333333333331, 0.9, 0.09999999999999998],
    [0.09999999999999998, 0.9, 0.09999999999999998],
    [0.09999999999999998, 0.9, 0.6333333333333333],
    [0.09999999999999998, 0.6333333333333331, 0.9],
]

export function colour_for_layer(layer: any) {
    let fill = layer["fill"]
    let scale_min = parseFloat(fill["scale_min"])
    let scale_max = parseFloat(fill["scale_max"])
    let scale_name = fill["scale_name"]
    let scale_nlevels = parseInt(fill["scale_nlevels"])
    console.log("scale_nlevels", scale_nlevels)
    // scale_flip = 'scale_flip' in fill and fill['scale_flip']
    let scale_flip = fill["scale_flip"] !== undefined && fill["scale_flip"]

    let scale = ColourScale.with_scale_or_flip(
        // definitions.get(scale_name, scale_nlevels),
        huey6,
        scale_min,
        scale_max,
        scale_flip
    )
    return scale
}

function add_class(rgb: any, expr: any) {
    console.log("rgb", rgb, "expr", expr)

    // rgb *= 255.
    // cls = self.make_class()
    // cls.setExpression(expr)
    // self.outline(cls)
    // style = self.make_style(cls)
    // style.color.setRGB(int(rgb.r), int(rgb.g), int(rgb.b))
    // style.color.alpha = int(opacity * 255)
}

function make_colour_scale(l: any, attr: any, cmin: any, cmax: any, opacity: any) {
    let scale = colour_for_layer(l)
    console.log("scale.nlevels", scale.nlevels)

    // below cmin
    let inc = parseFloat(cmax - cmin) / (scale.nlevels - 2)
    add_class(scale.lookup(cmin - inc), `(${attr} < ${cmin})`)
    // intermediate "within range" levels
    // for idx in xrange(1, scale.nlevels - 1):
    for (let idx = 1; idx <= scale.nlevels - 1; idx++) {
        let vfrom = cmin + (idx - 1) * inc
        let vto = vfrom + inc
        // we hedge on any floating-point rounding issues with a have increment jump into our level
        // for the colour lookup
        add_class(scale.lookup(vfrom + inc / 2), `(${attr} >= ${vfrom} AND ${attr} < ${vto})`)
    }
    // above cmin
    add_class(scale.lookup(cmax + inc), `(${attr} >= ${cmax})`)
}

// http://stackoverflow.com/a/14006964/7368493
function pairwise(arr: Array) {
    return arr.reduce(function(acc: any, current: any, index: any) {
        var isFirstPair = index % 2 === 0

        if (isFirstPair) {
            acc.push([current])
        } else {
            lastElement = acc[acc.length - 1]
            lastElement.push(current)
        }

        return acc
    }, [])
}

// http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h: any, s: any, l: any) {
    var r, g, b

    if (s == 0) {
        r = g = b = l // achromatic
    } else {
        var hue2rgb = function hue2rgb(p: any, q: any, t: any) {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s
        var p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function CopyProperties(source: any, target: any): void {
    for (var prop in source) {
        if (target[prop] !== undefined) {
            target[prop] = source[prop]
        } else {
            console.error("Cannot set undefined property: " + prop)
        }
    }
}
