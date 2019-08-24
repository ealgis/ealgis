import muiThemeable from "material-ui/styles/muiThemeable"
import * as React from "react"
import { connect } from "react-redux"
import { IModule as IMapsModule } from "../../redux/modules/maps";
import { eMapShared } from "../../redux/modules/maps"
import MapList from "./MapList"
import { IUser } from "../../redux/modules/ealgis";
import { IMUIThemePalette, IMUIThemeProps } from "../../redux/modules/interfaces";
import { IStore } from "../../redux/modules/reducer";

export interface IProps {}

export interface IStoreProps {
    isPrivateSite: boolean
    user: IUser
    maps: IMapsModule
    muiThemePalette: IMUIThemePalette
    tabName: string
}

export interface IDispatchProps {
    getMyMaps: Function
    getSharedMaps: Function
    getPublicMaps: Function
}

export class MapListContainer extends React.Component<IProps & IStoreProps & IDispatchProps, {}> {
    render() {
        const { tabName, isPrivateSite, user, maps, getMyMaps, getSharedMaps, getPublicMaps, muiThemePalette } = this.props

        if (user === null && isPrivateSite === true) {
            return null
        }

        const userId = user !== null ? user.id : null
        return (
            <MapList
                muiThemePalette={muiThemePalette}
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

const mapStateToProps = (state: IStore, ownProps: IMUIThemeProps): IStoreProps => {
    const { app, maps, ealgis } = state

    return {
        isPrivateSite: app.private_site,
        user: ealgis.user,
        maps,
        muiThemePalette: ownProps.muiTheme.palette,
        // @ts-ignore
        tabName: ownProps.routeParams.tabName,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        getMyMaps: (maps: Array<Array<any>>, userId: number | null) => {
            if (userId !== null) {
                return maps.filter((item: any) => {
                    return item[1].owner_user_id === userId
                })
            }
            return []
        },
        getSharedMaps: (maps: Array<Array<any>>, userId: number | null) => {
            if (userId !== null) {
                return maps.filter((item: any) => {
                    return item[1].owner_user_id !== userId && item[1].shared === eMapShared.AUTHENTICATED_USERS_SHARED
                })
            } else {
                return maps.filter((item: any) => {
                    return item[1].shared === eMapShared.AUTHENTICATED_USERS_SHARED
                })
            }
        },
        getPublicMaps: (maps: Array<Array<any>>, userId: number | null) => {
            if (userId !== null) {
                return maps.filter((item: any) => {
                    return item[1].owner_user_id !== userId && item[1].shared === eMapShared.PUBLIC_SHARED
                })
            } else {
                return maps.filter((item: any) => {
                    return item[1].shared === eMapShared.PUBLIC_SHARED
                })
            }
        },
    }
}

// Caused by muiThemable() https://github.com/mui-org/material-ui/issues/5975 - resolved in MaterialUI 1.0
// @ts-ignore
const MapListContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(MapListContainer)

export default muiThemeable()(MapListContainerWrapped)
