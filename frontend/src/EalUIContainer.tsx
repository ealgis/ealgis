import * as React from "react"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import EalUI from "./EalUI"
import { connect } from "react-redux"
import { proj } from "openlayers"
import { toggleSidebarState, setLastPage, toggleUserMenu } from "./redux/modules/app"
import { fetchUserMapsDataAndColourInfo, logoutUser } from "./redux/modules/ealgis"
import { toggleDebugMode, moveToGooglePlacesResult } from "./redux/modules/map"
import { iterate as iterateSnackbar } from "./redux/modules/snackbars"
import CircularProgress from "material-ui/CircularProgress"
import GoogleMapLoader from "react-google-maps-loader"
import { IStore, IAppModule, ISnackbarsModule, IUser } from "./redux/modules/interfaces"

import "./FixedLayout.css"

// FIXME - Where should API keys be stored?
const GOOGLE_MAPS_API_KEY = "AIzaSyBkKVBFX3fXV-kApr_TXLyQQKj9LhBrpQU" // Google Maps JavaScript API

export interface IProps {
    // From Props
    app: IAppModule
    user: IUser
    snackbars: ISnackbarsModule
    debug: boolean
    // From Dispatch to Props
    fetchStuff: Function
    onTapAppBarLeft: Function
    handleSnackbarClose: Function
    onDebugToggle: Function
    onReceiveAppPreviousPath: Function
    doLogout: Function
    handleOpenUserMenu: Function
    handleUserMenuOnRequestChange: Function
    handleGooglePlacesAutocomplete: Function
    // From Route
    content: any
    sidebar: any
    location: any
}

export class EalContainer extends React.Component<IProps, {}> {
    componentDidMount() {
        const { fetchStuff } = this.props
        fetchStuff()
    }

    componentWillReceiveProps(nextProps: IProps) {
        // Store the last page in history for navigation/ui that depeneds on knowing that sort of thing
        const { onReceiveAppPreviousPath, location } = this.props
        if (nextProps.location.pathname !== location.pathname) {
            onReceiveAppPreviousPath(location.pathname)
        }
    }

    render() {
        const {
            app,
            user,
            snackbars,
            debug,
            onTapAppBarLeft,
            handleSnackbarClose,
            onDebugToggle,
            doLogout,
            handleOpenUserMenu,
            handleUserMenuOnRequestChange,
            handleGooglePlacesAutocomplete,
            children,
            content,
            sidebar,
            location,
        } = this.props

        // Google Places Autocomplete should only appear when there is a map in the UI
        const showGooglePlacesBar: boolean = location.pathname.startsWith("/map/")

        if (app.loading === true) {
            return (
                <MuiThemeProvider>
                    <CircularProgress style={{ marginLeft: "48%", marginTop: "24%" }} />
                </MuiThemeProvider>
            )
        }

        return (
            <MuiThemeProvider>
                <EalUI
                    app={app}
                    user={user}
                    snackbars={snackbars}
                    debug={debug}
                    onTapAppBarLeft={onTapAppBarLeft}
                    handleSnackbarClose={handleSnackbarClose}
                    onDebugToggle={onDebugToggle}
                    doLogout={doLogout}
                    handleOpenUserMenu={handleOpenUserMenu}
                    handleUserMenuOnRequestChange={handleUserMenuOnRequestChange}
                    handleGooglePlacesAutocomplete={(lat: number, lon: number, result: object) =>
                        handleGooglePlacesAutocomplete(lat, lon, result, location.pathname)}
                    children={children}
                    content={content}
                    sidebar={sidebar}
                    showGooglePlacesBar={showGooglePlacesBar}
                />
            </MuiThemeProvider>
        )
    }
}

const mapStateToProps = (state: IStore) => {
    const { app, map, ealgis, snackbars } = state

    return {
        app: app,
        user: ealgis.user,
        snackbars: snackbars,
        debug: map.debug,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        fetchStuff: () => {
            dispatch(fetchUserMapsDataAndColourInfo())
        },
        onTapAppBarLeft: () => {
            dispatch(toggleSidebarState())
        },
        handleSnackbarClose: (reason: string) => {
            if (reason === "timeout") {
                dispatch(iterateSnackbar())
            }
        },
        onDebugToggle: () => {
            dispatch(toggleDebugMode())
        },
        onReceiveAppPreviousPath: (previousPath: string) => {
            dispatch(setLastPage(previousPath))
        },
        doLogout: () => {
            dispatch(logoutUser())
        },
        handleOpenUserMenu: () => {
            dispatch(toggleUserMenu(true))
        },
        handleUserMenuOnRequestChange: (value: boolean) => {
            dispatch(toggleUserMenu(value))
        },
        handleGooglePlacesAutocomplete: (lat: number, lon: number, result: any, pathname: string) => {
            // Only navigate if the map is visible
            if (pathname.startsWith("/map")) {
                const viewport = result.geometry.viewport.toJSON()
                dispatch(
                    moveToGooglePlacesResult(
                        proj.transformExtent(
                            [viewport.west, viewport.south, viewport.east, viewport.north],
                            "EPSG:4326",
                            "EPSG:900913"
                        )
                    )
                )
            }
        },
    }
}

const EalContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(EalContainer as any)

// export default EalContainerWrapped
export default GoogleMapLoader(EalContainerWrapped, {
    libraries: ["places"],
    key: GOOGLE_MAPS_API_KEY,
})
