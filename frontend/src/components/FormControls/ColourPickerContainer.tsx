import * as React from "react"
import { connect } from "react-redux"
import ColourPicker from "./ColourPicker"

export interface ColourPickerContainerProps {
    input: object
}

export class ColourPickerContainer extends React.Component<ColourPickerContainerProps, undefined> {
    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (JSON.stringify(this.props.input.value) !== JSON.stringify(nextProps.input.value)) {
            return true
        }
        return false
    }

    render() {
        const { input } = this.props
        return <ColourPicker colour={input.value} input={input} />
    }
}

const mapStateToProps = (state: any, ownProps: any) => ({})

const ColourPickerFieldContainerWrapped = connect(mapStateToProps)(ColourPickerContainer as any)

export default ColourPickerFieldContainerWrapped
