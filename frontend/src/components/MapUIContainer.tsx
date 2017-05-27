import * as React from "react";
import MapUI from "./MapUI";
import { connect } from 'react-redux';
import { proj } from 'openlayers';
import { receiveMapPosition, sendToDataInspector } from '../actions';


import 'openlayers/css/ol.css';

interface MapContainerRouteParams {
    mapId: Number
}

export interface MapContainerProps {
    dispatch: Function,
    params: any,
    mapDefinition: MapContainerRouteParams,
    position: object,
    onSingleClick: Function,
    onMoveEnd: Function,
}

export class MapContainer extends React.Component<MapContainerProps, undefined> {
    render() {
        const { mapDefinition, position, onSingleClick, onMoveEnd } = this.props
        
        return <MapUI
                    defn={mapDefinition}
                    position={position}
                    onSingleClick={(evt: any) => onSingleClick(mapDefinition.id, evt)}
                    onMoveEnd={(evt: any) => onMoveEnd(mapDefinition.id, evt)}
                />
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app, maps } = state
    
    return {
        mapDefinition: maps[ownProps.params.mapId],
        position: app.mapPosition,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSingleClick: (mapId: number, evt: any) => {
        let features: Array<any> = []
        evt.map.forEachFeatureAtPixel(evt.pixel, function(feature: any, layer: any) {
            const layerProps = layer.getProperties().properties
            const featureProps = feature.getProperties()
            delete featureProps.geometry
            
            features.push({
                "mapId": layerProps["mapId"],
                "layerId": layerProps["layerId"],
                "featureProps": featureProps
            }); 
        })
        
        dispatch(sendToDataInspector(mapId, features))
    },
    onMoveEnd: (mapId: number, event: object) => {
        const view = event.map.getView()
        const centreLonLat = proj.transform(view.getCenter(), 'EPSG:900913', 'EPSG:4326')

        const position = {
            center: {
                lon: centreLonLat[0],
                lat: centreLonLat[1],
            },
            zoom: view.getZoom(),
            resolution: view.getResolution(),
            extent: view.calculateExtent(event.map.getSize()),
        }
        dispatch(receiveMapPosition(position))
    },
  };
}

const MapContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MapContainer as any)

export default MapContainerWrapped