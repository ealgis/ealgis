import * as React from "react";
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { proj } from 'openlayers';
import MapUINav from "./MapUINav";
import { addLayer, duplicateMap, updateMapOrigin, resetMapPosition, deleteMap, toggleModalState, updateDataInspector, resetDataInspector, changeMapSharing } from '../actions';

interface MapUINavContainerRouteParams {
    id: Number
}

export interface MapUINavContainerProps {
    userId: number,
    tabName: string,
    mapDefinition: MapUINavContainerRouteParams,
    mapPosition: object,
    onSetOrigin: Function,
    onResetOrigin: Function,
    onChangeSharing: Function,
    onAddLayer: Function,
    onDuplicateMap: Function,
    onDeleteMap: Function,
    onToggleDeleteModalState: Function,
    deleteModalOpen: boolean,
    dataInspector: Array<any>,
    resetDataInspector: Function,
    previousPath: string,
    onExportWholeMap: Function,
    onExportMapViewport: Function,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    componentDidMount() {
        const { resetDataInspector, onResetOrigin, mapDefinition, location, previousPath } = this.props
        resetDataInspector()

        // If we came from anywhere except for a sub-route of /map/{mapId} then ensure
        // we reset the map extents to the default for this map.
        if(mapDefinition !== undefined && !previousPath.startsWith(location.pathname)) {
            onResetOrigin(mapDefinition.json.map_defaults)
        }
    }

    render() {
        const { tabName, mapDefinition, userId, mapPosition, onAddLayer, onDuplicateMap, onSetOrigin, onResetOrigin, onChangeSharing, onDeleteMap, onToggleDeleteModalState, deleteModalOpen, dataInspector, onExportWholeMap, onExportMapViewport, onCheckIncludeGeomAttrs } = this.props
        
        if(mapDefinition !== undefined) {
            return <MapUINav
                        tabName={tabName}
                        defn={mapDefinition}
                        isOwner={mapDefinition.owner_user_id === userId}
                        onDuplicateMap={() => onDuplicateMap(mapDefinition.id)}
                        onAddLayer={() => onAddLayer(mapDefinition.id)}
                        onSetOrigin={() => onSetOrigin(mapDefinition, mapPosition)}
                        onChangeSharing={(event: object, value: any) => onChangeSharing(mapDefinition.id, value)}
                        onResetOrigin={() => onResetOrigin(mapDefinition.json.map_defaults)}
                        onDeleteMap={() => onDeleteMap(mapDefinition.id)}
                        onToggleDeleteModalState={() => onToggleDeleteModalState()}
                        deleteModalOpen={deleteModalOpen}
                        dataInspector={dataInspector}
                        onExportWholeMap={() => onExportWholeMap(mapDefinition.id)}
                        onExportMapViewport={() => onExportMapViewport(mapDefinition.id, mapPosition.extent)}
                        onCheckIncludeGeomAttrs={(event: object, isInputChecked: boolean) => onCheckIncludeGeomAttrs(isInputChecked)}
                    />;
        }
        return <div></div>
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps, app, user } = state
    return {
        userId: user.id,
        tabName: ownProps.params.tabName,
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
        dispatch(resetMapPosition({
            center: proj.transform([mapDefaults.lon, mapDefaults.lat], "EPSG:4326", "EPSG:900913"),
            zoom: mapDefaults.zoom,
        }))
    },
    onChangeSharing: (mapId: number, shared: number) => {
        dispatch(changeMapSharing(mapId, shared))
    },
    onToggleDeleteModalState: () => {
        dispatch(toggleModalState("deleteMap"))
    },
    onDeleteMap: (mapId: number) => {
        dispatch(toggleModalState("deleteMap"))
        dispatch(deleteMap(mapId));
    },
    resetDataInspector: () => {
        dispatch(resetDataInspector())
    },
    onExportWholeMap: (mapId: number) => {
        const include_geom_attrs: boolean = (this.isIncludeGeomAttrsChecked) ? true : false
        window.location.href = `/api/0.1/maps/${mapId}/export_csv.json?include_geom_attrs=${include_geom_attrs}`
    },
    onExportMapViewport: (mapId: number, extent: Array<number>) => {
        const include_geom_attrs: boolean = (this.isIncludeGeomAttrsChecked) ? true : false
        const extentLonLat = proj.transformExtent(extent, 'EPSG:900913', 'EPSG:4326')
        window.location.href = `/api/0.1/maps/${mapId}/export_csv_viewport.json?include_geom_attrs=${include_geom_attrs}&ne=${extentLonLat[1]},${extentLonLat[0]}&sw=${extentLonLat[3]},${extentLonLat[2]}`
    },
    onCheckIncludeGeomAttrs: (isInputChecked: boolean) => {
        // FIXME Should be in state or props. What's best practice for attributes like this?
        this.isIncludeGeomAttrsChecked = isInputChecked
    },
  };
}

const MapUINavContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(MapUINavContainer as any)

export default MapUINavContainerWrapped