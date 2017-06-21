import * as React from "react"
import reactCSS from "reactcss"
import { SwatchesPicker, RGBColor } from "react-color"
import { Colour } from "../../alpha-picker/components/AlphaPicker"

export interface ColourPickerProps {
    colour: RGBColor
    input: any
}

class ColourPicker extends React.Component<ColourPickerProps, {}> {
    state = {
        displayColorPicker: false,
    }

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    }

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    }

    handleChange = (colour: Colour) => {
        const { input: { onChange } } = this.props
        onChange(colour.rgb)
        this.handleClose()
    }

    render() {
        const { colour } = this.props

        const styles = reactCSS({
            default: {
                color: {
                    width: "100%",
                    height: "20px",
                    borderRadius: "2px",
                    background: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`,
                },
                swatch: {
                    background: "#fff",
                    borderRadius: "1px",
                    boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                    display: "inline-block",
                    cursor: "pointer",
                    width: "95%",
                },
                popover: {
                    position: "absolute",
                    zIndex: 2,
                },
                cover: {
                    position: "fixed",
                    top: "0px",
                    right: "0px",
                    bottom: "0px",
                    left: "0px",
                },
            },
        })

        return (
            <div>
                <div style={styles.swatch} onClick={this.handleClick}>
                    <div style={styles.color} />
                </div>
                {this.state.displayColorPicker
                    ? <div style={styles.popover}>
                          <div style={styles.cover} onClick={this.handleClose} />
                          <SwatchesPicker color={colour} onChange={this.handleChange} />
                      </div>
                    : null}

            </div>
        )
    }
}

export default ColourPicker
