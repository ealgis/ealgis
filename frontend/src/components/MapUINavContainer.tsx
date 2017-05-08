import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import MapUINav from "./MapUINav";
import { addLayer, duplicateMap, updateMapOrigin, resetMapPosition, deleteMap, toggleModalState, updateDataInspector, resetDataInspector } from '../actions';

interface MapUINavContainerRouteParams {
    id: Number
}

export interface MapUINavContainerProps {
    mapDefinition: MapUINavContainerRouteParams,
    mapPosition: object,
    onSetOrigin: Function,
    onResetOrigin: Function,
    onAddLayer: Function,
    onDuplicateMap: Function,
    onDeleteMap: Function,
    onToggleDeleteModalState: Function,
    deleteModalOpen: boolean,
    dataInspector: Array<any>,
    resetDataInspector: Function,
    previousPath: string,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    componentDidMount() {
        const { resetDataInspector, onResetOrigin, mapDefinition, location, previousPath } = this.props
        resetDataInspector()

        // If we came from anywhere except for a sub-route of /map/{mapId} then ensure
        // we reset the map extents to the default for this map.
        if(!previousPath.startsWith(location.pathname)) {
            onResetOrigin(mapDefinition.json.map_defaults)
        }
    }

    render() {
        const { mapDefinition, mapPosition, onAddLayer, onDuplicateMap, onSetOrigin, onResetOrigin, onDeleteMap, onToggleDeleteModalState, deleteModalOpen, dataInspector } = this.props
        if(mapDefinition !== undefined) {
            return <MapUINav
                        defn={mapDefinition}
                        onDuplicateMap={() => onDuplicateMap(mapDefinition.id)}
                        onAddLayer={() => onAddLayer(mapDefinition.id)}
                        onSetOrigin={() => onSetOrigin(mapDefinition, mapPosition)}
                        onResetOrigin={() => onResetOrigin(mapDefinition.json.map_defaults)}
                        onDeleteMap={() => onDeleteMap(mapDefinition.id)}
                        onToggleDeleteModalState={() => onToggleDeleteModalState()}
                        deleteModalOpen={deleteModalOpen}
                        dataInspector={dataInspector}
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
        deleteModalOpen: app.dialogs["deleteMap"] || false,
        dataInspector: app.dataInspector,
        previousPath: app.previousPath,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onAddLayer: (mapId: number) => {
        dispatch(addLayer(mapId))
    },
    onDuplicateMap: (mapId: number) => {
        dispatch(duplicateMap(mapId))
    },
    onSetOrigin: (mapDefinition: object, position: object) => {
        dispatch(updateMapOrigin(mapDefinition, position))
    },
    onResetOrigin: (mapDefaults: any) => {
        dispatch(resetMapPosition(mapDefaults))
    },
    onToggleDeleteModalState: () => {
        dispatch(toggleModalState("deleteMap"))
    },
    onDeleteMap: (mapId: number/*, cb: Function*/) => {
        dispatch(toggleModalState("deleteMap"))
        dispatch(deleteMap(mapId/*, cb*/));
    },
    resetDataInspector: () => {
        dispatch(resetDataInspector())
    }
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