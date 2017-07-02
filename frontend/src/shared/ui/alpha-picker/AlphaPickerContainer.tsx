import * as React from "react"
import { connect } from "react-redux"
import AlphaPicker from "./AlphaPicker"

export interface AlphaPickerContainerProps {
    input: any
    width: string
}

export class AlphaPickerContainer extends React.Component<AlphaPickerContainerProps, undefined> {
    public static defaultProps = {
        width: "100%",
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (this.props.input.value !== nextProps.input.value) {
            return true
        }
        return false
    }

    render() {
        const { width, input } = this.props

        return <AlphaPicker alpha={input.value} width={width} input={input} />
    }
}

const mapStateToProps = (state: any) => ({})

const AlphaPickerFieldContainerWrapped = connect(mapStateToProps)(AlphaPickerContainer)

export default AlphaPickerFieldContainerWrapped
