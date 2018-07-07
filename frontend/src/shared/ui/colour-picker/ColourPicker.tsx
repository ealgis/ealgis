import * as React from "react"
import { RGBColor, SwatchesPicker } from "react-color"
import styled from "styled-components"
import { Colour } from "../alpha-picker/AlphaPicker"

export interface ColourPickerProps {
    colour: RGBColor
    input: any
}

const Swatch = styled.div`
    background: #fff;
    border-radius: 1px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .1);
    display: inline-block;
    cursor: pointer;
    width: 95%;
`

interface IColourPatchProps {
    colour: RGBColor;
}

const ColourPatch = styled<IColourPatchProps, any>("div")` /* tslint:disable */
    width: 100%;
    height: 20px;
    border-radius: 2px;
    background: rgba(${(props: any) => props.colour.r}, ${(props: any) => props.colour.g}, ${(props: any) => props.colour.b}, ${(props: any) => props.colour.a});
`

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
        const {
            input: { onChange },
        } = this.props
        onChange(colour.rgb)
        this.handleClose()
    }

    render() {
        const { colour } = this.props

        return (
            <React.Fragment>
                <Swatch onClick={this.handleClick}>
                    <ColourPatch colour={colour as any} />
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

export default ColourPicker
