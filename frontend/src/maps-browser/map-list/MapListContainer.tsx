import { entries as objectEntries } from "core-js/library/fn/object"
import muiThemeable from "material-ui/styles/muiThemeable"
import * as React from "react"
import { connect } from "react-redux"
import { IMapsModule, IMUIThemePalette, IMUIThemeProps, IStore, IUser } from "../../redux/modules/interfaces"
import { eMapShared } from "../../redux/modules/maps"
import MapList from "./MapList"

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
                getMyMaps={() => getMyMaps(objectEntries(maps), userId)}
                getSharedMaps={() => getSharedMaps(objectEntries(maps), userId)}
                getPublicMaps={() => getPublicMaps(objectEntries(maps), userId)}
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
