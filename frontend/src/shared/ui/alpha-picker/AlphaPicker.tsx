import * as React from "react"
import { AlphaPicker, HSLColor, RGBColor } from "react-color"

export interface ColourPickerProps {
    alpha: number
    width: string
    input: any
}

export interface Colour {
    hex: string
    hsl: HSLColor
    hsv: HSVColor
    oldHue: number
    rgb: RGBColor
    source: string
}

interface HSVColor {
    h: number
    s: number
    v: number
    a: number
}

class ColourPicker extends React.Component<ColourPickerProps, undefined> {
    handleChange = (color: Colour) => {
        const {
            input: { onChange },
        } = this.props
        onChange(color.rgb.a)
    }

    render() {
        const { alpha, width } = this.props
        const rgb = { r: 0, g: 0, b: 0, a: alpha }

        return <AlphaPicker color={rgb} width={width} onChange={this.handleChange as any} />
    }
}

export default ColourPicker
