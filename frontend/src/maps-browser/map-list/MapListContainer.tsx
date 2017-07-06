import * as React from "react"
import { connect } from "react-redux"
import { entries as objectEntries } from "core-js/library/fn/object"
import MapList from "./MapList"
import { IStore, IMap, IMapsModule, IMUIThemePalette, IMUIThemeProps } from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

export interface IProps {}

export interface IStoreProps {
    userId: number
    maps: IMapsModule
    muiThemePalette: IMUIThemePalette
}

export interface IDispatchProps {
    getMyMaps: Function
    getSharedMaps: Function
    getPublicMaps: Function
}

export interface IRouteProps {
    tabName: string
}

export class MapListContainer extends React.Component<IProps & IStoreProps & IDispatchProps & IRouteProps, {}> {
    render() {
        const { tabName, userId, maps, getMyMaps, getSharedMaps, getPublicMaps, muiThemePalette } = this.props

        return (
            <MapList
                muiThemePalette={muiThemePalette}
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

const mapStateToProps = (state: IStore, ownProps: IMUIThemeProps): IStoreProps => {
    const { maps, ealgis } = state

    return {
        userId: ealgis.user.id,
        maps,
        muiThemePalette: ownProps.muiTheme.palette,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
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

const MapListContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(MapListContainer)

export default muiThemeable()(MapListContainerWrapped)
