import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { proj } from "openlayers"
import MapUINav from "./components/MapUINav"
import { toggleModalState } from "../../redux/modules/app"
import { restoreDefaultMapPosition, moveToPosition, setHighlightedFeatures } from "../../redux/modules/map"
import { reset as resetDataInspector } from "../../redux/modules/datainspector"
import {
    addLayer,
    duplicateMap,
    updateMapOrigin,
    removeMap,
    changeMapSharing,
    exportMap,
    exportMapViewport,
    copyShareableLink,
} from "../../redux/modules/maps"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"

interface MapUINavContainerRouteParams {
    id: Number
}

export interface MapUINavContainerProps {
    userId: number
    tabName: string
    mapDefinition: MapUINavContainerRouteParams
    mapPosition: object
    onSetOrigin: Function
    onMoveToPosition: Function
    onResetOrigin: Function
    onChangeSharing: Function
    onAddLayer: Function
    onDuplicateMap: Function
    onDeleteMap: Function
    onToggleDeleteModalState: Function
    deleteModalOpen: boolean
    resetDataInspector: Function
    previousPath: string
    onExportWholeMap: Function
    onExportMapViewport: Function
    onGetShareableLink: Function
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    componentDidMount() {
        const { resetDataInspector, onMoveToPosition, mapDefinition, location, previousPath } = this.props
        resetDataInspector()

        // If we came from anywhere except for a sub-route of /map/{mapId} then ensure
        // we reset the map extents to the default for this map.
        if (mapDefinition !== undefined && !previousPath.startsWith(location.pathname)) {
            onMoveToPosition(mapDefinition.json.map_defaults)
        }
    }

    render() {
        const {
            tabName,
            mapDefinition,
            userId,
            mapPosition,
            onAddLayer,
            onDuplicateMap,
            onSetOrigin,
            onResetOrigin,
            onChangeSharing,
            onDeleteMap,
            onToggleDeleteModalState,
            deleteModalOpen,
            onExportWholeMap,
            onExportMapViewport,
            onCheckIncludeGeomAttrs,
            onGetShareableLink,
        } = this.props

        if (mapDefinition !== undefined) {
            return (
                <MapUINav
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
                    onExportWholeMap={() => onExportWholeMap(mapDefinition.id)}
                    onExportMapViewport={() => onExportMapViewport(mapDefinition.id, mapPosition.extent)}
                    onCheckIncludeGeomAttrs={(event: object, isInputChecked: boolean) =>
                        onCheckIncludeGeomAttrs(isInputChecked)}
                    onGetShareableLink={onGetShareableLink}
                />
            )
        }
        return <div />
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps, app, map, ealgis } = state
    return {
        userId: ealgis.user.id,
        tabName: ownProps.params.tabName,
        mapDefinition: maps[ownProps.params.mapId],
        mapPosition: map.position,
        deleteModalOpen: app.modals["deleteMap"] || false,
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
        onMoveToPosition: (mapDefaults: any) => {
            dispatch(
                moveToPosition({
                    center: proj.transform([mapDefaults.lon, mapDefaults.lat], "EPSG:4326", "EPSG:900913"),
                    zoom: mapDefaults.zoom,
                })
            )
        },
        onResetOrigin: (mapDefaults: any) => {
            dispatch(
                restoreDefaultMapPosition({
                    center: proj.transform([mapDefaults.lon, mapDefaults.lat], "EPSG:4326", "EPSG:900913"),
                    zoom: mapDefaults.zoom,
                })
            )
        },
        onChangeSharing: (mapId: number, shared: number) => {
            dispatch(changeMapSharing(mapId, shared))
        },
        onToggleDeleteModalState: () => {
            dispatch(toggleModalState("deleteMap"))
        },
        onDeleteMap: (mapId: number) => {
            dispatch(toggleModalState("deleteMap"))
            dispatch(removeMap(mapId))
        },
        resetDataInspector: () => {
            dispatch(resetDataInspector())
        },
        onExportWholeMap: (mapId: number) => {
            dispatch(exportMap())
            const include_geom_attrs: boolean = this.isIncludeGeomAttrsChecked ? true : false
            window.location.href = `/api/0.1/maps/${mapId}/export_csv.json?include_geom_attrs=${include_geom_attrs}`
        },
        onExportMapViewport: (mapId: number, extent: Array<number>) => {
            const include_geom_attrs: boolean = this.isIncludeGeomAttrsChecked ? true : false
            dispatch(exportMapViewport(include_geom_attrs))

            const extentLonLat = proj.transformExtent(extent, "EPSG:900913", "EPSG:4326")
            window.location.href = `/api/0.1/maps/${mapId}/export_csv_viewport.json?include_geom_attrs=${include_geom_attrs}&ne=${extentLonLat[1]},${extentLonLat[0]}&sw=${extentLonLat[3]},${extentLonLat[2]}`
        },
        onCheckIncludeGeomAttrs: (isInputChecked: boolean) => {
            // FIXME Should be in state or props. What's best practice for attributes like this?
            this.isIncludeGeomAttrsChecked = isInputChecked
        },
        onGetShareableLink: () => {
            dispatch(copyShareableLink())
            dispatch(sendSnackbarNotification(`Map link copied to clipboard.`))
        },
    }
}

const MapUINavContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(MapUINavContainer as any)

export default MapUINavContainerWrapped
