import * as React from "react"
import MapUI from "./MapUI"
import { connect } from "react-redux"
import { proj } from "openlayers"
import { loadRecords as loadDataInspector } from "../../redux/modules/datainspector"
import { savePosition, setHighlightedFeatures } from "../../redux/modules/map"
import { IStore, IMap, IPosition, IOLFeature, IOLFeatureProps } from "../../redux/modules/interfaces"

import "openlayers/css/ol.css"

export interface IProps {
    params: IRouteProps
}

export interface IStateProps {
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

export class MapContainer extends React.Component<IProps & IStateProps & IDispatchProps & IRouteProps, {}> {
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

const mapStateToProps = (state: IStore, ownProps: { params: IRouteProps }): IStateProps => {
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
                center: proj.transform(view.getCenter(), "EPSG:900913", "EPSG:4326"),
                zoom: view.getZoom(),
                resolution: view.getResolution(),
                extent: view.calculateExtent(event.map.getSize()),
            }
            dispatch(savePosition(position))
        },
    }
}

const MapContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(MapContainer)

export default MapContainerWrapped
