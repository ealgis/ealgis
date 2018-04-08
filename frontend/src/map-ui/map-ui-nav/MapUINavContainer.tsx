import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import olProj from "ol/proj"
import MapUINav from "./MapUINav"
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
    eMapShared,
} from "../../redux/modules/maps"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import {
    IStore,
    IMap,
    IPosition,
    IMapPositionDefaults,
    IMUITheme,
    IMUIThemePalette,
} from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

interface IProps {}

export interface IStoreProps {
    // From Props
    userId: number
    tabName: string
    mapDefinition: IMap
    mapPosition: IPosition
    deleteModalOpen: boolean
    previousPath: string
    muiThemePalette: IMUIThemePalette
}

export interface IDispatchProps {
    onAddLayer: Function
    onDuplicateMap: Function
    onSetOrigin: Function
    onMoveToPosition: Function
    onResetOrigin: Function
    onChangeSharing: Function
    onToggleDeleteModalState: Function
    onDeleteMap: Function
    resetDataInspector: Function
    onExportWholeMap: Function
    onExportMapViewport: Function
    onCheckIncludeGeomAttrs: Function
    onGetShareableLink: Function
}

interface IRouteProps {
    mapId: number
    tabName: string
}

interface IRouterProps {
    location: any
}

interface IOwnProps {
    params: IRouteProps
    muiTheme: IMUITheme
}

export class MapUINavContainer extends React.Component<
    IProps & IStoreProps & IDispatchProps & IRouteProps & IRouterProps,
    {}
> {
    isIncludeGeomAttrsChecked: boolean = false

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
        const that: MapUINavContainer = this

        const {
            userId,
            tabName,
            mapDefinition,
            mapPosition,
            deleteModalOpen,
            muiThemePalette,
            onAddLayer,
            onDuplicateMap,
            onSetOrigin,
            onResetOrigin,
            onChangeSharing,
            onDeleteMap,
            onToggleDeleteModalState,
            onExportWholeMap,
            onExportMapViewport,
            onCheckIncludeGeomAttrs,
            onGetShareableLink,
        } = this.props

        if (mapDefinition !== undefined) {
            return (
                <MapUINav
                    muiThemePalette={muiThemePalette}
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
                    onExportWholeMap={() => {
                        onExportWholeMap(that, mapDefinition.id)
                    }}
                    onExportMapViewport={() => {
                        onExportMapViewport(that, mapDefinition.id, mapPosition.extent)
                    }}
                    onCheckIncludeGeomAttrs={(event: any, isInputChecked: boolean) => {
                        onCheckIncludeGeomAttrs(that, isInputChecked)
                    }}
                    onGetShareableLink={onGetShareableLink}
                />
            )
        }
        return <div />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { maps, app, map, ealgis } = state
    return {
        userId: ealgis.user.id,
        tabName: ownProps.params.tabName,
        mapDefinition: maps[ownProps.params.mapId],
        mapPosition: map.position,
        deleteModalOpen: app.modals.get("deleteMap") || false,
        previousPath: app.previousPath,
        muiThemePalette: ownProps.muiTheme.palette,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onAddLayer: (mapId: number) => {
            dispatch(addLayer(mapId))
        },
        onDuplicateMap: (mapId: number) => {
            dispatch(duplicateMap(mapId))
        },
        onSetOrigin: (mapDefinition: IMap, position: IPosition) => {
            dispatch(updateMapOrigin(mapDefinition, position))
        },
        onMoveToPosition: (mapDefaults: IMapPositionDefaults) => {
            const position: IPosition = {
                center: olProj.transform([mapDefaults.lon, mapDefaults.lat], "EPSG:4326", "EPSG:900913"),
                zoom: mapDefaults.zoom,
            }
            dispatch(moveToPosition(position))
        },
        onResetOrigin: (mapDefaults: IMapPositionDefaults) => {
            const position: IPosition = {
                center: olProj.transform([mapDefaults.lon, mapDefaults.lat], "EPSG:4326", "EPSG:900913"),
                zoom: mapDefaults.zoom,
            }
            dispatch(restoreDefaultMapPosition(position))
        },
        onChangeSharing: (mapId: number, shared: eMapShared) => {
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
        onExportWholeMap: function(that: MapUINavContainer, mapId: number) {
            dispatch(exportMap())
            const include_geom_attrs: boolean = that.isIncludeGeomAttrsChecked ? true : false
            window.location.href = `/api/0.1/maps/${mapId}/export_csv.json?include_geom_attrs=${include_geom_attrs}`
        },
        onExportMapViewport: function(
            that: MapUINavContainer,
            mapId: number,
            extent: [number, number, number, number]
        ) {
            const include_geom_attrs: boolean = that.isIncludeGeomAttrsChecked ? true : false
            dispatch(exportMapViewport(include_geom_attrs))

            const extentLonLat = olProj.transformExtent(extent, "EPSG:900913", "EPSG:4326")
            window.location.href = `/api/0.1/maps/${mapId}/export_csv_viewport.json?include_geom_attrs=${include_geom_attrs}&ne=${extentLonLat[1]},${extentLonLat[0]}&sw=${extentLonLat[3]},${extentLonLat[2]}`
        },
        onCheckIncludeGeomAttrs: function(that: MapUINavContainer, isInputChecked: boolean) {
            // FIXME Should be in state or props. What's best practice for attributes like this?
            that.isIncludeGeomAttrsChecked = isInputChecked
        },
        onGetShareableLink: () => {
            dispatch(copyShareableLink())
            dispatch(sendSnackbarNotification(`Map link copied to clipboard.`))
        },
    }
}

const MapUINavContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(MapUINavContainer)

export default muiThemeable()(MapUINavContainerWrapped)
