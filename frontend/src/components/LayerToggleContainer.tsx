import * as React from "react";
import { connect } from 'react-redux';
import LayerToggle from "./LayerToggle";
import { changeLayerVisibility } from '../actions';

export interface LayerToggleContainerProps {
    layerDefinition: Object,
    layerId: number,
    mapId: number,
    mapDefinition: object,
    onToggle: Function,
}

export class LayerToggleContainer extends React.Component<LayerToggleContainerProps, undefined> {
    render() {
        const { layerDefinition, layerId, mapId, mapDefinition, onToggle } = this.props
        return <LayerToggle layerDefinition={layerDefinition} mapId={mapId} onToggle={() => onToggle(mapDefinition, layerId)} />;
    }
}

const mapStateToProps = (state: any, ownProps: object) => {
    return {
        mapDefinition: state.maps[ownProps.mapId]
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onToggle: (map: object, layerId: number) => {
        dispatch(changeLayerVisibility(map, layerId));
    }
  };
}

const LayerToggleContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayerToggleContainer as any)

export default LayerToggleContainerWrapped