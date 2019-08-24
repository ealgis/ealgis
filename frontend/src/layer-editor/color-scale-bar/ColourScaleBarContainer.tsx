import * as React from "react"
import { connect } from "react-redux"
import { ColourScale } from "../../shared/openlayers/colour_scale"
import ColourScaleBar from "./ColourScaleBar"
import { IStore } from "../../redux/modules/reducer";

export interface IProps {
    colourName: string
    colourLevel: number
    scaleMin: number
    scaleMax: number
    scaleFlip: boolean
    opacity: number
}

export interface IStoreProps {
    colourScale: ColourScale
}

export interface IDispatchProps {}

export class ColourScaleBarContainer extends React.PureComponent<IProps & IStoreProps & IDispatchProps, {}> {
    render() {
        const { colourName, colourScale, opacity } = this.props

        return <ColourScaleBar colourName={colourName} colourScale={colourScale} opacity={opacity} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { ealgis } = state

    return {
        colourScale: ColourScale.with_scale_or_flip(
            ealgis.colourdefs[`${ownProps.colourName}.${ownProps.colourLevel}`],
            ownProps.scaleMin,
            ownProps.scaleMax,
            ownProps.scaleFlip
        ),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const ColourScaleBarContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    ColourScaleBarContainer
)

export default ColourScaleBarContainerWrapped
