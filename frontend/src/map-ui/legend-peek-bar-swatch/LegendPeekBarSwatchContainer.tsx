import * as React from "react"
import { connect } from "react-redux"
import LegendPeekBarSwatch from "./components/LegendPeekBarSwatch"
import * as isEqual from "lodash/isEqual"
import { IOLStyleDef } from "../../redux/modules/interfaces"

export interface IProps {
    styleDef: IOLStyleDef
    onMouseEnter: Function
    onMouseLeave: Function
}

export class LegendPeekBarSwatchContainer extends React.Component<IProps, {}> {
    shouldComponentUpdate(nextProps: IProps) {
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