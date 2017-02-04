import * as React from "react";
import { connect } from 'react-redux';
import MapUINav from "./MapUINav";
import { closeMap } from '../actions';

interface MapUINavContainerRouteParams {
    mapId: Number
}

export interface MapUINavContainerProps {
    map_definition: MapUINavContainerRouteParams,
    onCloseMap: Function,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    render() {
        const { map_definition, onCloseMap } = this.props
        return <MapUINav defn={map_definition} onCloseMap={() => onCloseMap()} />;
    }
}

const mapStateToProps = (state: any) => {
    const { map_definition } = state
    return {
        map_definition: map_definition
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onToggle: () => {
        dispatch(closeMap());
    }
  };
}

const MapUINavContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(MapUINavContainer as any)

export default MapUINavContainerWrapped