import * as React from "react"
import { connect } from "react-redux"
import MapList from "./MapList"

export interface MapListContainerProps {
    tabName: string
    userId: number
    maps: any
    getMyMaps: Function
    getSharedMaps: Function
    getPublicMaps: Function
}

export class MapListContainer extends React.Component<MapListContainerProps, undefined> {
    render() {
        const { tabName, userId, maps, getMyMaps, getSharedMaps, getPublicMaps } = this.props

        return (
            <MapList
                tabName={tabName}
                userId={userId}
                maps={maps}
                getMyMaps={() => getMyMaps(Object.entries(maps), userId)}
                getSharedMaps={() => getSharedMaps(Object.entries(maps), userId)}
                getPublicMaps={() => getPublicMaps(Object.entries(maps), userId)}
            />
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps, user } = state
    return {
        tabName: ownProps.params.tabName,
        userId: user.id,
        maps,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        getMyMaps: (maps: Array<object>, userId: number) => {
            return maps.filter((item: object) => {
                return item[1].owner_user_id === userId
            })
        },
        getSharedMaps: (maps: Array<object>, userId: number) => {
            return maps.filter((item: object) => {
                return item[1].owner_user_id !== userId && item[1].shared === 2
            })
        },
        getPublicMaps: (maps: Array<object>, userId: number) => {
            return maps.filter((item: object) => {
                return item[1].owner_user_id !== userId && item[1].shared === 3
            })
        },
    }
}

const MapListContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(MapListContainer as any)

export default MapListContainerWrapped
