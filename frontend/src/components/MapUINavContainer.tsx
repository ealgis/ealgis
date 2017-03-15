import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import MapUINav from "./MapUINav";
import { closeMap, deleteMap } from '../actions';

interface MapUINavContainerRouteParams {
    id: Number
}

export interface MapUINavContainerProps {
    mapDefinition: MapUINavContainerRouteParams,
    onDeleteMap: Function,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    render() {
        const { mapDefinition, onDeleteMap } = this.props
        return <MapUINav defn={mapDefinition} onDeleteMap={() => onDeleteMap(mapDefinition.id)} />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps } = state
    return {
        mapDefinition: maps[ownProps.params.mapId]
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onDeleteMap: (mapId: number/*, cb: Function*/) => {
        dispatch(deleteMap(mapId/*, cb*/));
    },
    // onSuccessDeleteMap: () => {
    //     browserHistory.push("/")
    // }
  };
}

const MapUINavContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(MapUINavContainer as any)

export default MapUINavContainerWrapped