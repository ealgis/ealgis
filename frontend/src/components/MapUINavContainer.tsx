import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import MapUINav from "./MapUINav";
import { duplicateMap, updateMapOrigin, resetMapPosition, deleteMap } from '../actions';

interface MapUINavContainerRouteParams {
    id: Number
}

export interface MapUINavContainerProps {
    mapDefinition: MapUINavContainerRouteParams,
    mapPosition: object,
    onSetOrigin: Function,
    onResetOrigin: Function,
    onDuplicateMap: Function,
    onDeleteMap: Function,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    render() {
        const { mapDefinition, mapPosition, onDuplicateMap, onSetOrigin, onResetOrigin, onDeleteMap } = this.props
        if(mapDefinition !== undefined) {
            return <MapUINav
                        defn={mapDefinition}
                        onDuplicateMap={() => onDuplicateMap(mapDefinition.id)}
                        onSetOrigin={() => onSetOrigin(mapDefinition, mapPosition)}
                        onResetOrigin={() => onResetOrigin(mapDefinition.json.map_defaults)}
                        onDeleteMap={() => onDeleteMap(mapDefinition.id)}
                    />;
        }
        return <div></div>
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps, app } = state
    return {
        mapDefinition: maps[ownProps.params.mapId],
        mapPosition: app.mapPosition,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onDuplicateMap: (mapId: number) => {
        dispatch(duplicateMap(mapId))
    },
    onSetOrigin: (mapDefinition: object, position: object) => {
        dispatch(updateMapOrigin(mapDefinition, position))
    },
    onResetOrigin: (mapDefaults: any) => {
        dispatch(resetMapPosition(mapDefaults))
    },
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