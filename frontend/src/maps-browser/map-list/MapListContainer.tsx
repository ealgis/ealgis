import { entries as objectEntries } from "core-js/library/fn/object"
import muiThemeable from "material-ui/styles/muiThemeable"
import * as React from "react"
import { connect } from "react-redux"
import { IMUIThemePalette, IMUIThemeProps, IMapsModule, IStore, IUser } from "../../redux/modules/interfaces"
import MapList from "./MapList"

export interface IProps {}

export interface IStoreProps {
    user: IUser
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
        const { tabName, user, maps, getMyMaps, getSharedMaps, getPublicMaps, muiThemePalette } = this.props

        if (user === null) {
            return <div />
        }

        return (
            <MapList
                muiThemePalette={muiThemePalette}
                tabName={tabName}
                userId={user.id}
                maps={maps}
                getMyMaps={() => getMyMaps(objectEntries(maps), user.id)}
                getSharedMaps={() => getSharedMaps(objectEntries(maps), user.id)}
                getPublicMaps={() => getPublicMaps(objectEntries(maps), user.id)}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IMUIThemeProps): IStoreProps => {
    const { maps, ealgis } = state

    return {
        user: ealgis.user,
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

// Caused by muiThemable() https://github.com/mui-org/material-ui/issues/5975 - resolved in MaterialUI 1.0
// @ts-ignore
const MapListContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(MapListContainer)

export default muiThemeable()(MapListContainerWrapped)
