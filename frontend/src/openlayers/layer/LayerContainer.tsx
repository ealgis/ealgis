import * as React from "react"
import Layer from "./components/Layer"
import { compileLayerStyle } from "../../shared/openlayers/OLStyle"
import { connect } from "react-redux"

export interface LayerContainerProps {
    map: any
    layer: any
    layerId: number
    debugMode: boolean
    highlightedFeatures: Array<number>
}

export class LayerContainer extends React.Component<LayerContainerProps, undefined> {
    render() {
        const { map, layer, layerId, debugMode, highlightedFeatures } = this.props
        layer.olStyle = compileLayerStyle(layer, debugMode, highlightedFeatures)
        return <Layer map={map} layer={layer} layerId={layerId} debugMode={debugMode} />
    }
}

const mapStateToProps = (state: any) => {
    const { app } = state
    return {
        debugMode: app.debug,
        highlightedFeatures: app.highlightedFeatures,
    }
}

const LayerContainerWrapped = connect(mapStateToProps)(LayerContainer)

export default LayerContainerWrapped
