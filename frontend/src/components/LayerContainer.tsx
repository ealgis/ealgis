import * as React from "react";
import Layer from "./Layer";
import { compileLayerStyle } from '../utils/OLStyle'
import { connect } from 'react-redux';

import './FixedLayout.css';

export interface LayerContainerProps {
    map: any,
    layer: any,
}

export class LayerContainer extends React.Component<LayerContainerProps, undefined> {
    render() {
        const { map, layer } = this.props
        layer.olStyle = compileLayerStyle(layer)
        return <Layer map={map} layer={layer}/>;
    }
}

const mapStateToProps = (state: any) => {
    return {
        
    }
}

const LayerContainerWrapped = connect(
    mapStateToProps
)(LayerContainer)

export default LayerContainerWrapped