import * as React from "react";
import { connect } from 'react-redux';
import MapUINav from "./MapUINav";

interface MapUINavContainerRouteParams {
    mapId: Number
}

export interface MapUINavContainerProps {
    map_definition: MapUINavContainerRouteParams,
}

export class MapUINavContainer extends React.Component<MapUINavContainerProps, undefined> {
    render() {
        const { map_definition } = this.props
        return <MapUINav defn={map_definition} />;
    }
}

const mapStateToProps = (state: any) => {
    const { map_definition } = state
    return {
        map_definition: map_definition
    }
}

const MapUINavContainerWrapped = connect(
    mapStateToProps
)(MapUINavContainer)

export default MapUINavContainerWrapped