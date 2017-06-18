import * as React from "react"
import Layer from "./components/Layer"
import { compileLayerStyle } from "../../shared/openlayers/OLStyle"
import { connect } from "react-redux"
import { IStore, IMap, ILayer } from "../../redux/modules/interfaces"

export interface IProps {
    // From Props
    layerId: number
    map: IMap
    layer: ILayer
    // From Store
    debugMode: boolean
    highlightedFeatures: Array<number>
}

export class LayerContainer extends React.Component<IProps, {}> {
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

const LayerContainerWrapped = connect(mapStateToProps)(LayerContainer)

export default LayerContainerWrapped
