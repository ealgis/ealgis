import "blueimp-canvas-to-blob"
import { saveAs } from "file-saver"
import muiThemeable from "material-ui/styles/muiThemeable"
import olProj from "ol/proj"
import * as React from "react"
import { connect } from "react-redux"
import { toggleModalState } from "../../redux/modules/app"
import { reset as resetDataInspector } from "../../redux/modules/datainspector"
import { IMUITheme, IMUIThemePalette } from "../../redux/modules/interfaces"
import { moveToPosition, restoreDefaultMapPosition, IPosition } from "../../redux/modules/map"
import {
    addLayer,
    changeMapSharing,
    copyShareableLink,
    duplicateMap,
    eMapShared,
    exportMap,
    exportMapViewport,
    removeMap,
    updateMapOrigin,
    IMap,
    IMapPositionDefaults,
} from "../../redux/modules/maps"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import MapUINav from "./MapUINav"
import { IStore } from "../../redux/modules/reducer";

interface IProps {}

export interface IStoreProps {
    // From Props
    userId: number | null
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
    onDownloadMap: Function
    onSetOrigin: Function
    onMoveToPosition: Function
    onResetOrigin: Function
    onChangeSharing: Function
    onToggleDeleteModalState: Function
    onDeleteMap: Function
    resetDataInspector: Function
    onExportWholeMap: Function
    onExportMapViewport: Function
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

export class MapUINavContainer extends React.Component<IProps & IStoreProps & IDispatchProps & IRouteProps & IRouterProps, {}> {
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
            onDownloadMap,
            onSetOrigin,
            onResetOrigin,
            onChangeSharing,
            onDeleteMap,
            onToggleDeleteModalState,
            onExportWholeMap,
            onExportMapViewport,
            onGetShareableLink,
        } = this.props

        if (mapDefinition !== undefined) {
            return (
                <MapUINav
                    muiThemePalette={muiThemePalette}
                    tabName={tabName}
                    defn={mapDefinition}
                    isOwner={userId !== null && mapDefinition.owner_user_id === userId}
                    isLoggedIn={userId !== null}
                    onDuplicateMap={() => onDuplicateMap(mapDefinition.id)}
                    onDownloadMap={() => onDownloadMap(mapDefinition)}
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
        userId: ealgis.user !== null ? ealgis.user.id : null,
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
        onDownloadMap: (map: IMap) => {
            // https://openlayers.org/en/latest/examples/export-map.html
            // We're being lazy - assume the map has already finised loading
            // so we don't need to access the OpenLayers `map` object.
            const filename = `ealgis-${map["name-url-safe"]}.jpeg`
            const canvas: any = document.querySelectorAll(".ol-viewport > canvas")[0]
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(canvas.msToBlob(), filename)
            } else if ("toBlob" in HTMLCanvasElement.prototype) {
                canvas.toBlob(
                    function(blob: any) {
                        saveAs(blob, filename)
                    },
                    "image/jpeg",
                    1
                )
            } else {
                dispatch(
                    sendSnackbarNotification("Sorry, map downloading doesn't work in your browser. Chrome, Firefox or Safari will work.")
                )
            }
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
            window.location.href = `/api/0.1/maps/${mapId}/export_csv.json`
        },
        onExportMapViewport: function(that: MapUINavContainer, mapId: number, extent: [number, number, number, number]) {
            dispatch(exportMapViewport())

            const extentLonLat = olProj.transformExtent(extent, "EPSG:900913", "EPSG:4326")
            window.location.href = `/api/0.1/maps/${mapId}/export_csv_viewport.json?ne=${extentLonLat[1]},${extentLonLat[0]}&sw=${
                extentLonLat[3]
            },${extentLonLat[2]}`
        },
        onGetShareableLink: () => {
            dispatch(copyShareableLink())
            dispatch(sendSnackbarNotification(`Map link copied to clipboard.`))
        },
    }
}

// Caused by muiThemable() https://github.com/mui-org/material-ui/issues/5975 - resolved in MaterialUI 1.0
// @ts-ignore
const MapUINavContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    MapUINavContainer
)

export default muiThemeable()(MapUINavContainerWrapped)
