import * as React from "react"
import { connect } from "react-redux"
import ColourPickerNoInput from "./ColourPickerNoInput"

export interface ColourPickerNoInputContainerProps {
    colour: any
    onChange: any
}

export class ColourPickerNoInputContainer extends React.Component<ColourPickerNoInputContainerProps, undefined> {
    // shouldComponentUpdate(nextProps: any, nextState: any) {
    //     if (JSON.stringify(this.props.colour) !== JSON.stringify(nextProps.colour)) {
    //         return true
    //     }
    //     return false
    // }

    render() {
        const { colour, onChange } = this.props
        // console.log("ColourPickerNoInput.props", this.props)
        return <ColourPickerNoInput colour={colour} onChange={onChange} />
    }
}

const mapStateToProps = (state: any, ownProps: any) => ({})

const ColourPickerNoInputFieldContainerWrapped = connect(mapStateToProps)(ColourPickerNoInputContainer as any)

export default ColourPickerNoInputFieldContainerWrapped
