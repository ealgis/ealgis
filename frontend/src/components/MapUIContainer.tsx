import * as React from "react";
import MapUI from "./MapUI";
import { connect } from 'react-redux';
import { proj } from 'openlayers';
import { receiveMapPosition } from '../actions';


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
}

export class MapContainer extends React.Component<MapContainerProps, undefined> {
    render() {
        const { mapDefinition, onNavigation } = this.props

        if(mapDefinition !== undefined) {
            return <MapUI defn={mapDefinition} onNavigation={(evt: any) => onNavigation(evt)} />;
        }
        return <div></div>
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app, maps } = state
    return {
        app: app,
        mapDefinition: maps[ownProps.params.mapId]
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onNavigation: (state: any) => {
        if("center" in state) {
            const latlons = proj.transform(state.center, 'EPSG:900913', 'EPSG:4326')
            state.center = {
                lon: latlons[0],
                lat: latlons[1],
            }
        }

        dispatch(receiveMapPosition(state))
    },
  };
}

const MapContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MapContainer as any)

export default MapContainerWrapped