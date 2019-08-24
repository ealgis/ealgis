import { IMap } from "../redux/modules/maps";

export function getMapURL(map: IMap) {
    return `/map/${map.id}/${map["name-url-safe"]}`
}

// http://stackoverflow.com/a/14006964/7368493
export function pairwise(arr: Array<any>) {
    let lastElement
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
// Modified for Ealgis to return in the 0 - 1 range, not 0 - 255
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
export function hsltorgb(h: any, s: any, l: any) {
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

    return [r, g, b]
}

export function capitaliseFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
