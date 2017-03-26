import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import LayerUINav from "./LayerUINav";
import { toggleModal } from '../actions';

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
        const { layerDefinition, mapId, layerId, onDeleteLayer } = this.props
        const deleteConfirmModalId = "LayerDeleteConfirmDialog"
        
        return <LayerUINav defn={layerDefinition} layerId={layerId} mapId={mapId} onDeleteLayer={() => onDeleteLayer(deleteConfirmModalId)} deleteConfirmModalId={deleteConfirmModalId} />;
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