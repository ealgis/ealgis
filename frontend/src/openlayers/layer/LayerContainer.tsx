import * as React from "react"
import { connect } from "react-redux"
import { ILayer, IMap, IStore } from "../../redux/modules/interfaces"
import { compileLayerStyle } from "../../shared/openlayers/OLStyle"
import Layer from "./Layer"

export interface IProps {
    layerId: number
    map: IMap
    layer: ILayer
}

export interface IStoreProps {
    debugMode: boolean
    highlightedFeatures: Array<number>
}

export class LayerContainer extends React.Component<IProps & IStoreProps, {}> {
    render() {
        const { map, layer, layerId, debugMode, highlightedFeatures } = this.props
        layer.olStyle = compileLayerStyle(layer, debugMode, highlightedFeatures)
        return <Layer map={map} layer={layer} layerId={layerId} debugMode={debugMode} />
    }
}

const mapStateToProps = (state: IStore) => {
    const { map } = state

    return {
        debugMode: map.debug,
        highlightedFeatures: map.highlightedFeatures,
    }
}

const LayerContainerWrapped = connect<IStoreProps, {}, IProps, IStore>(mapStateToProps)(LayerContainer)

export default LayerContainerWrapped
