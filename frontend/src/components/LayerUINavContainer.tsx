import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import LayerUINav from "./LayerUINav";
import { cloneMapLayer, toggleModal } from '../actions';

interface LayerUINavContainerRouteParams {
    id: Number
}

export interface LayerUINavContainerProps {
    layerDefinition: LayerUINavContainerRouteParams,
    mapId: number,
    mapDefinition: object,
    layerId: number,
    onCloneLayer: Function,
    onDeleteLayer: Function,
}

export class LayerUINavContainer extends React.Component<LayerUINavContainerProps, undefined> {
    render() {
        const { layerDefinition, mapId, layerId, onCloneLayer, onDeleteLayer } = this.props
        const deleteConfirmModalId = "LayerDeleteConfirmDialog"
        
        return <LayerUINav 
                    defn={layerDefinition} 
                    layerId={layerId} 
                    mapId={mapId} 
                    onCloneLayer={() => onCloneLayer(mapId, layerId)} 
                    onDeleteLayer={() => onDeleteLayer(deleteConfirmModalId)} 
                    deleteConfirmModalId={deleteConfirmModalId} 
                />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps } = state
    return {
        layerDefinition: ownProps.layerDefinition,
        mapId: ownProps.mapId,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onCloneLayer: (mapId: number, layerId: number) => {
        dispatch(cloneMapLayer(mapId, layerId))
    },
    onDeleteLayer: (modalId: string) => {
        dispatch(toggleModal(modalId))
    },
  };
}

const LayerUINavContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayerUINavContainer as any)

export default LayerUINavContainerWrapped