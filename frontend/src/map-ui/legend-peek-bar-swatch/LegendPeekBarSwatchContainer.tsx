import * as React from "react"
import { connect } from "react-redux"
import LegendPeekBarSwatch from "./components/LegendPeekBarSwatch"
import * as isEqual from "lodash/isEqual"

export interface LegendPeekBarSwatchContainerProps {
    styleDef: object
    onMouseEnter: Function
    onMouseLeave: Function
}

export class LegendPeekBarSwatchContainer extends React.Component<LegendPeekBarSwatchContainerProps, undefined> {
    shouldComponentUpdate(nextProps: any, nextState: any) {
        const { styleDef } = this.props
        return !isEqual(styleDef, nextProps.styleDef)
    }

    render() {
        const { styleDef, onMouseEnter, onMouseLeave } = this.props

        return (
            <LegendPeekBarSwatch
                styleDef={styleDef}
                onMouseEnter={() => onMouseEnter(styleDef)}
                onMouseLeave={() => onMouseLeave(styleDef)}
            />
        )
    }
}

export default LegendPeekBarSwatchContainer
