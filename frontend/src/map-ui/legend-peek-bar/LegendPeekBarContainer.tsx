import { isEqual } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import { receiveLegendPeekLabel } from "../../redux/modules/legends"
import LegendPeekBar from "./LegendPeekBar"
import { IOLStyleDef, IOLStyleDefExpression } from "../../redux/modules/maps";
import { IStore } from "../../redux/modules/reducer";

export interface IProps {
    mapId: number
    layerId: number
    olStyleDef: Array<IOLStyleDef>
}

export interface IStoreProps {
    labelText: string
}

export interface IDispatchProps {
    handleMouseEnter: Function
    handleMouseLeave: Function
}

export class LegendPeekBarContainer extends React.Component<IProps & IStoreProps & IDispatchProps, {}> {
    shouldComponentUpdate(nextProps: IProps & IStoreProps) {
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

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { legends } = state

    return {
        labelText: legends.legendpeek[ownProps.mapId + "-" + ownProps.layerId],
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        handleMouseEnter: (mapId: number, layerId: number, styleDef: IOLStyleDef) => {
            const expressionToString = (e: IOLStyleDefExpression) => `${e["op"]} ${parseFloat(e["v"].toFixed(2)).toLocaleString()}`
            let labelText: string = ""

            if ("from" in styleDef.expr && "to" in styleDef.expr) {
                labelText = `${parseFloat(styleDef.expr.from!.v.toFixed(2)).toLocaleString()} - ${parseFloat(
                    styleDef.expr.to!.v.toFixed(2)
                ).toLocaleString()}`
            } else if ("to" in styleDef.expr) {
                labelText = expressionToString(styleDef.expr.to!)
            } else if ("from" in styleDef.expr) {
                labelText = expressionToString(styleDef.expr.from!)
            }

            dispatch(receiveLegendPeekLabel(mapId, layerId, labelText))
        },
        handleMouseLeave: (mapId: number, layerId: number) => {
            dispatch(receiveLegendPeekLabel(mapId, layerId, ""))
        },
    }
}

const LegendPeekBarContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    LegendPeekBarContainer
)

export default LegendPeekBarContainerWrapped
