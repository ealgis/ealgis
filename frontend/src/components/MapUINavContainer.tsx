import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import MapUINav from "./MapUINav";
import { duplicateMap, updateMapOrigin, resetMapPosition, deleteMap, toggleModalState, updateDataInspector, resetDataInspector } from '../actions';

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
    onToggleDeleteModalState: Function,
    deleteModalOpen: boolean,
    dataInspector: Array<any>,
    resetDataInspector: Function,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    componentDidMount() {
        const { resetDataInspector, onResetOrigin, mapDefinition } = this.props
        resetDataInspector()
        onResetOrigin(mapDefinition.json.map_defaults)
    }

    render() {
        const { mapDefinition, mapPosition, onDuplicateMap, onSetOrigin, onResetOrigin, onDeleteMap, onToggleDeleteModalState, deleteModalOpen, dataInspector } = this.props
        if(mapDefinition !== undefined) {
            return <MapUINav
                        defn={mapDefinition}
                        onDuplicateMap={() => onDuplicateMap(mapDefinition.id)}
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