import * as React from "react";
import Layer from "./Layer";
import { compileLayerStyle } from '../utils/OLStyle'
import { connect } from 'react-redux';

import './FixedLayout.css';

export interface LayerContainerProps {
    map: any,
    layer: any,
    layerId: number,
    debugMode: boolean,
}

export class LayerContainer extends React.Component<LayerContainerProps, undefined> {
    render() {
        const { map, layer, layerId, debugMode } = this.props
        layer.olStyle = compileLayerStyle(layer, debugMode)
        return <Layer map={map} layer={layer} layerId={layerId} debugMode={debugMode} />;
    }
}

const mapStateToProps = (state: any) => {
    const { app } = state
    return {
        debugMode: app.debug,
    }
}

const LayerContainerWrapped = connect(
    mapStateToProps
)(LayerContainer)

export default LayerContainerWrapped