import * as React from "react";
import MapUI from "./MapUI";
import { connect } from 'react-redux';
import { proj } from 'openlayers';
import { receiveMapPosition, toggleAllowMapViewSetting, sendToDataInspector } from '../actions';


import 'openlayers/css/ol.css';

interface MapContainerRouteParams {
    mapId: Number
}

export interface MapContainerProps {
    dispatch: Function,
    params: any,
    mapDefinition: MapContainerRouteParams,
    onSingleClick: Function,
    onNavigation: Function,
    app: object,
    allowMapViewSetting: boolean,
}

export class MapContainer extends React.Component<MapContainerProps, undefined> {
    render() {
        const { mapDefinition, onSingleClick, onNavigation, allowMapViewSetting } = this.props

        return <MapUI
                    defn={mapDefinition}
                    onSingleClick={(evt: any) => onSingleClick(evt)}
                    onNavigation={(evt: any) => onNavigation(evt, allowMapViewSetting)}
                    allowMapViewSetting={allowMapViewSetting}
                />
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app, maps } = state
    return {
        app: app,
        mapDefinition: maps[ownProps.params.mapId],
        allowMapViewSetting: app.allowMapViewSetting,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSingleClick: (evt: any) => {
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
        
        dispatch(sendToDataInspector(features))
    },
    onNavigation: (mapCentreOrResolution: any, allowMapViewSetting: boolean) => {
        // Prevent infinite loops - if we've received a prompt to update the app's
        // mapPosition from the map then always reset the toggleAllowMapViewSetting
        // off. We toggle this to on in calls to actions -> resetMapPosition()
        if(allowMapViewSetting) {
            dispatch(toggleAllowMapViewSetting())
        }

        // Centre is provided in Web Mercator, but we need WGS84.
        if("center" in mapCentreOrResolution) {
            const latlons = proj.transform(mapCentreOrResolution.center, 'EPSG:900913', 'EPSG:4326')
            mapCentreOrResolution.center = {
                lon: latlons[0],
                lat: latlons[1],
            }
        }

        dispatch(receiveMapPosition(mapCentreOrResolution))
    },
  };
}

const MapContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MapContainer as any)

export default MapContainerWrapped