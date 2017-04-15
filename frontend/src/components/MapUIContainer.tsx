import * as React from "react";
import MapUI from "./MapUI";
import { connect } from 'react-redux';
import { proj } from 'openlayers';
import { receiveMapPosition, toggleAllowMapViewSetting } from '../actions';


import 'openlayers/css/ol.css';

interface MapContainerRouteParams {
    mapId: Number
}

export interface MapContainerProps {
    dispatch: Function,
    params: any,
    mapDefinition: MapContainerRouteParams,
    onNavigation: Function,
    app: object,
    allowMapViewSetting: boolean,
}

export class MapContainer extends React.Component<MapContainerProps, undefined> {
    render() {
        const { mapDefinition, onNavigation, allowMapViewSetting } = this.props

        return <MapUI defn={mapDefinition} onNavigation={(evt: any) => onNavigation(evt, allowMapViewSetting)} allowMapViewSetting={allowMapViewSetting} />
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