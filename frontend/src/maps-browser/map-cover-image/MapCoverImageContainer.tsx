import * as React from "react"
import MapCoverImage from "./MapCoverImage"
import { connect } from "react-redux"
import { IStore, IMap } from "../../redux/modules/interfaces"

export interface IProps {
    mapDefinition: IMap
    width: number
    height: number
}

export class MapCoverImageContainer extends React.Component<IProps, {}> {
    render() {
        const { mapDefinition, width, height } = this.props
        return <MapCoverImage defn={mapDefinition} width={width} height={height} />
    }
}

const mapStateToProps = (state: IStore) => {
    return {}
}

const MapCoverImageContainerWrapped = connect<{}, {}, IProps>(mapStateToProps)(MapCoverImageContainer)

export default MapCoverImageContainerWrapped
