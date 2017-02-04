import * as React from "react";
import { connect } from 'react-redux';
import MapUINav from "./MapUINav";

interface MapUINavContainerRouteParams {
    mapId: Number
}

export interface MapUINavContainerProps {
    params: any,
    mapDefinition: MapUINavContainerRouteParams,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    render() {
        const { mapDefinition, children } = this.props
        return <MapUINav defn={mapDefinition}/>;
    }
}

const mapStateToProps = (state: any) => {
    const { map_definition } = state
    return {
        mapDefinition: map_definition
    }
}

const MapUINavContainerWrapped = connect(
    mapStateToProps
)(MapUINavContainer)

export default MapUINavContainerWrapped