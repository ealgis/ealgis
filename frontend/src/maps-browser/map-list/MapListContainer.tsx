import * as React from "react"
import { connect } from "react-redux"
import { entries as objectEntries } from "core-js/library/fn/object"
import MapList from "./components/MapList"
import { IStore, IMap, IMapsModule } from "../../redux/modules/interfaces"

export interface IProps {
    // From Store
    tabName: string
    userId: number
    maps: IMapsModule
    getMyMaps: Function
    getSharedMaps: Function
    getPublicMaps: Function
    // From Route
}

export interface IRouteProps {
    tabName: string
}

export class MapListContainer extends React.Component<IProps, {}> {
    render() {
        const { tabName, userId, maps, getMyMaps, getSharedMaps, getPublicMaps } = this.props

        return (
            <MapList
                tabName={tabName}
                userId={userId}
                maps={maps}
                getMyMaps={() => getMyMaps(objectEntries(maps), userId)}
                getSharedMaps={() => getSharedMaps(objectEntries(maps), userId)}
                getPublicMaps={() => getPublicMaps(objectEntries(maps), userId)}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: { params: IRouteProps }) => {
    const { maps, ealgis } = state

    return {
        // tabName: ownProps.params.tabName,
        userId: ealgis.user.id,
        maps,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        getMyMaps: (maps: Array<Array<any>>, userId: number) => {
            return maps.filter((item: any) => {
                return item[1].owner_user_id === userId
            })
        },
        getSharedMaps: (maps: Array<Array<any>>, userId: number) => {
            return maps.filter((item: any) => {
                return item[1].owner_user_id !== userId && item[1].shared === 2
            })
        },
        getPublicMaps: (maps: Array<Array<any>>, userId: number) => {
            return maps.filter((item: any) => {
                return item[1].owner_user_id !== userId && item[1].shared === 3
            })
        },
    }
}

const MapListContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(MapListContainer as any)

export default MapListContainerWrapped
