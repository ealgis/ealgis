import * as React from "react"
import { connect } from "react-redux"
import { IMap, IStore } from "../../redux/modules/interfaces"
import MapCoverImage from "./MapCoverImage"

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

// @ts-ignore
const MapCoverImageContainerWrapped = connect<{}, {}, IProps, IStore>(mapStateToProps)(MapCoverImageContainer)

export default MapCoverImageContainerWrapped
