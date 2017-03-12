import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import MapUINav from "./MapUINav";
import { closeMap, deleteMap } from '../actions';

interface MapUINavContainerRouteParams {
    id: Number
}

export interface MapUINavContainerProps {
    map_definition: MapUINavContainerRouteParams,
    onDeleteMap: Function,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    render() {
        const { map_definition, onDeleteMap } = this.props
        return <MapUINav defn={map_definition} onDeleteMap={() => onDeleteMap(map_definition.id)} />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { map_definition, maps } = state
    return {
        map_definition: maps[ownProps.params.mapId]
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