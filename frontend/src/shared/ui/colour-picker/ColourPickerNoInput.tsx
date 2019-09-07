import * as React from "react"
import { RGBColor, SwatchesPicker } from "react-color"
import styled from "styled-components"
import { Colour } from "../alpha-picker/AlphaPicker"

export interface ColourPickerNoInputProps {
    colour: RGBColor | undefined
    onChange: any
}

const Swatch = styled.div`
    background: #fff;
    border-radius: 1px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    display: inline-block;
    cursor: pointer;
    width: 95%;
`

const ColourPatch = styled.div`
    width: 100%;
    height: 20px;
    border-radius: 2px;
` as any

const Popover = styled.div`
    position: absolute;
    z-index: 2;
    left: 10%;
`

const Cover = styled.div`
    position: fixed;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
`

class ColourPickerNoInput extends React.Component<ColourPickerNoInputProps, any> {
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
        const { onChange } = this.props
        onChange(colour.rgb)
        this.handleClose()
    }

    render() {
        const { colour } = this.props
        const background = colour !== undefined ? `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})` : undefined

        return (
            <React.Fragment>
                <Swatch onClick={this.handleClick}>
                    <ColourPatch colour={colour as any} style={{ background: background }} />
                </Swatch>
                {this.state.displayColorPicker ? (
                    <Popover>
                        <Cover onClick={this.handleClose} />
                        <SwatchesPicker color={colour} onChange={this.handleChange as any} />
                    </Popover>
                ) : null}
            </React.Fragment>
        )
    }
}

export default ColourPickerNoInput
