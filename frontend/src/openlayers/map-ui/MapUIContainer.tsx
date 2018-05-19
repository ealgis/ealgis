import "ol/ol.css"
import olProj from "ol/proj"
import * as React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { loadRecords as loadDataInspector } from "../../redux/modules/datainspector"
import { IMap, IOLFeature, IOLFeatureProps, IPosition, IStore } from "../../redux/modules/interfaces"
import { savePosition, setHighlightedFeatures } from "../../redux/modules/map"
import MapUI from "./MapUI"

export interface IProps {
    params: IRouteProps
}

export interface IStoreProps {
    // From State
    mapDefinition: IMap
    position: IPosition
}

export interface IDispatchProps {
    onSingleClick: Function
    onMoveEnd: Function
}

export interface IRouteProps {
    mapId: number
    mapName: string
}

export class MapUIContainer extends React.Component<IProps & IStoreProps & IDispatchProps & IRouteProps, {}> {
    render() {
        const { mapDefinition, position, onSingleClick, onMoveEnd } = this.props

        return (
            <MapUI
                defn={mapDefinition}
                position={position}
                onSingleClick={(evt: any) => onSingleClick(mapDefinition.id, evt)}
                onMoveEnd={onMoveEnd}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: any): IStoreProps => {
    const { maps, map } = state

    return {
        mapDefinition: maps[ownProps.params.mapId],
        position: map.position,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onSingleClick: (mapId: number, evt: any) => {
            let features: Array<IOLFeature> = []
            let featurGids: Array<number> = []

            evt.map.forEachFeatureAtPixel(evt.pixel, function(feature: any, layer: any) {
                const layerProps = layer.getProperties().properties
                const featureProps: IOLFeatureProps = feature.getProperties()
                delete featureProps.geometry

                features.push({
                    mapId: layerProps["mapId"],
                    layerId: layerProps["layerId"],
                    featureProps: featureProps,
                })

                featurGids.push(featureProps.gid)
            })

            dispatch(setHighlightedFeatures(featurGids))
            dispatch(loadDataInspector(mapId, features))
        },
        onMoveEnd: (event: any) => {
            const view = event.map.getView()

            const position: IPosition = {
                center: olProj.transform(view.getCenter(), "EPSG:900913", "EPSG:4326"),
                zoom: view.getZoom(),
                resolution: view.getResolution(),
                extent: view.calculateExtent(event.map.getSize()),
            }
            dispatch(savePosition(position))
        },
    }
}

const MapUIContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(MapUIContainer)

// @ts-ignore
export default withRouter(MapUIContainerWrapped)
