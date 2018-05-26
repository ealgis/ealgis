import * as React from "react"
import { connect } from "react-redux"
import { IColourDefs } from "../../redux/modules/ealgis"
import { ILayer, IMap, IStore } from "../../redux/modules/interfaces"
import { compileLayerStyle } from "../../shared/openlayers/OLStyle"
import { getLayerOLStyleDefinition } from "../../shared/openlayers/colour_scale"
import Layer from "./Layer"

export interface IProps {
    layerId: number
    map: IMap
    layer: ILayer
}

export interface IStoreProps {
    debugMode: boolean
    highlightedFeatures: Array<number>
    colourdefs: IColourDefs
}

export class LayerContainer extends React.Component<IProps & IStoreProps, {}> {
    render() {
        const { map, layer, layerId, debugMode, highlightedFeatures, colourdefs } = this.props

        layer["olStyleDef"] = getLayerOLStyleDefinition(layer, colourdefs)
        layer["olStyle"] = compileLayerStyle(layer, layerId, debugMode, highlightedFeatures)

        return <Layer map={map} layer={layer} layerId={layerId} debugMode={debugMode} />
    }
}

const mapStateToProps = (state: IStore, ownProps: any): IStoreProps => {
    const { ealgis, map } = state

    return {
        debugMode: map.debug,
        highlightedFeatures: map.highlightedFeatures,
        colourdefs: ealgis.colourdefs,
    }
}

const LayerContainerWrapped = connect<IStoreProps, {}, IProps, IStore>(mapStateToProps)(LayerContainer)

export default LayerContainerWrapped
