import * as React from "react";
import { connect } from 'react-redux';
import LayerToggle from "./LayerToggle";
import { changeLayerVisibility } from '../actions';

export interface LayerToggleContainerProps {
    l: Object,
    mapId: number,
    onToggle: Function,
}

export class LayerToggleContainer extends React.Component<LayerToggleContainerProps, undefined> {
    render() {
        const { l, mapId, onToggle } = this.props
        return <LayerToggle l={l} mapId={mapId} onToggle={() => onToggle(mapId, l)} />;
    }
}

const mapStateToProps = (state: any) => {
    return {
        
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onToggle: (mapId: any, l: any) => {
        dispatch(changeLayerVisibility(mapId, l.hash));
    }
  };
}

const LayerToggleContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayerToggleContainer as any)

export default LayerToggleContainerWrapped