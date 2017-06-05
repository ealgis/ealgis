import * as React from "react"
import MapCoverImage from "./MapCoverImage"
import { connect } from "react-redux"

interface MapCoverImageContainerRouteParams {
    mapId: Number
}

export interface MapCoverImageContainerProps {
    mapDefinition: MapCoverImageContainerRouteParams
    width: number
    height: number
}

export class MapCoverImageContainer extends React.Component<MapCoverImageContainerProps, undefined> {
    render() {
        const { mapDefinition, width, height } = this.props
        return <MapCoverImage defn={mapDefinition} width={width} height={height} />
    }
}

const mapStateToProps = (state: any) => {
    return {}
}

const MapCoverImageContainerWrapped = connect(mapStateToProps)(MapCoverImageContainer)

export default MapCoverImageContainerWrapped
