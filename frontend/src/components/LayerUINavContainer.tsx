import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import LayerUINav from "./LayerUINav";
import { deleteMapLayer } from '../actions';

interface LayerUINavContainerRouteParams {
    id: Number
}

export interface LayerUINavContainerProps {
    layerDefinition: LayerUINavContainerRouteParams,
    mapId: number,
    mapDefinition: object,
    layerId: number,
    onDeleteLayer: Function,
}

export class LayerUINavContainer extends React.Component<LayerUINavContainerProps, undefined> {
    render() {
        const { layerDefinition, mapDefinition, mapId, layerId, onDeleteLayer } = this.props
        
        return <LayerUINav defn={layerDefinition} layerId={layerId} mapId={mapId} onDeleteLayer={() => onDeleteLayer(mapDefinition, layerId, layerDefinition)} />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps } = state
    return {
        layerDefinition: ownProps.layerDefinition,
        mapId: ownProps.mapId,
        mapDefinition: maps[ownProps.mapId],
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onDeleteLayer: (map: object, layerId: number, layer: object) => {
        dispatch(deleteMapLayer(map, layerId));
    },
  };
}

const LayerUINavContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayerUINavContainer as any)

export default LayerUINavContainerWrapped