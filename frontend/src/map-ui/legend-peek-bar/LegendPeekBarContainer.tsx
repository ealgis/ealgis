import * as React from "react"
import { connect } from "react-redux"
import LegendPeekBar from "./components/LegendPeekBar"
import { isEqual } from "lodash-es"
import { receiveLegendPeekLabel } from "../../redux/modules/legends"
import { IStore, IOLStyleDef } from "../../redux/modules/interfaces"

export interface IProps {
    // From props
    mapId: number
    layerId: number
    olStyleDef: Array<IOLStyleDef>
    // From Store
    labelText: string
    // From Dispatch to Prps
    handleMouseEnter: Function
    handleMouseLeave: Function
}

export class LegendPeekBarContainer extends React.Component<IProps, {}> {
    shouldComponentUpdate(nextProps: IProps) {
        const { olStyleDef, labelText } = this.props

        if (!isEqual(olStyleDef, nextProps.olStyleDef)) {
            return true
        }

        if (labelText !== nextProps.labelText) {
            return true
        }
        return false
    }

    render() {
        const { mapId, layerId, olStyleDef, labelText, handleMouseEnter, handleMouseLeave } = this.props

        return (
            <LegendPeekBar
                layerId={layerId}
                olStyleDef={olStyleDef}
                handleMouseEnter={(styleDef: object) => handleMouseEnter(mapId, layerId, styleDef)}
                handleMouseLeave={(styleDef: object) => handleMouseLeave(mapId, layerId)}
                labelText={labelText}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps) => {
    const { legends } = state

    return {
        labelText: legends.legendpeek[ownProps.mapId + "-" + ownProps.layerId],
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        handleMouseEnter: (mapId: number, layerId: number, styleDef: IOLStyleDef) => {
            let labelText: string = ""
            if ("to" in styleDef.expr) {
                labelText = `${parseFloat(styleDef.expr.from.v.toFixed(2)).toLocaleString()} - ${parseFloat(
                    styleDef.expr.to!.v.toFixed(2)
                ).toLocaleString()}`
            } else {
                labelText = `>= ${parseFloat(styleDef.expr.from.v.toFixed(2)).toLocaleString()}`
            }

            dispatch(receiveLegendPeekLabel(mapId, layerId, labelText))
        },
        handleMouseLeave: (mapId: number, layerId: number) => {
            dispatch(receiveLegendPeekLabel(mapId, layerId, ""))
        },
    }
}

const LegendPeekBarContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(LegendPeekBarContainer as any)

export default LegendPeekBarContainerWrapped
