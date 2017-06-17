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

import "./FixedLayout.css"

// FIXME - Where should API keys be stored?
const GOOGLE_MAPS_API_KEY = "AIzaSyBkKVBFX3fXV-kApr_TXLyQQKj9LhBrpQU" // Google Maps JavaScript API

export interface EalContainerProps {
    app: object
    debug: boolean
    snackbars: any
    user: any
    dispatch: Function
    content: any
    sidebar: any
    onTapAppBarLeft: Function
    handleSnackbarClose: Function
    doLogout: Function
    fetchStuff: Function
    onDebugToggle: Function
    location: object
    onReceiveAppPreviousPath: Function
    handleOpenUserMenu: Function
    handleUserMenuOnRequestChange: Function
    handleGooglePlacesAutocomplete: Function
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        const { fetchStuff } = this.props
        fetchStuff()

        // Because LiveReload still hardcodes HTTP by default
        // https://github.com/statianzo/webpack-livereload-plugin/issues/23
        if (DEVELOPMENT === true) {
            const script = document.createElement("script")
            script.src = "//localhost:35729/livereload.js"
            script.async = true
            document.body.appendChild(script)
        }
    }

    componentWillReceiveProps(nextProps: object) {
        // Store the last page in history for navigation/ui that depeneds on knowing that sort of thing
        const { onReceiveAppPreviousPath, location } = this.props
        if (nextProps.location.pathname !== location.pathname) {
            onReceiveAppPreviousPath(location.pathname)
        }
    }

    render() {
        const {
            app,
            debug,
            snackbars,
            user,
            children,
            content,
            sidebar,
            location,
            onTapAppBarLeft,
            handleSnackbarClose,
            doLogout,
            onDebugToggle,
            handleOpenUserMenu,
            handleUserMenuOnRequestChange,
            handleGooglePlacesAutocomplete,
        } = this.props

        // Google Places Autocomplete should only appear when there is a map in the UI
        const showGooglePlacesBar = location.pathname.startsWith("/map/")

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
                    debug={debug}
                    snackbars={snackbars}
                    user={user}
                    children={children}
                    content={content}
                    sidebar={sidebar}
                    onTapAppBarLeft={onTapAppBarLeft}
                    handleSnackbarClose={handleSnackbarClose}
                    doLogout={doLogout}
                    onDebugToggle={onDebugToggle}
                    handleOpenUserMenu={handleOpenUserMenu}
                    handleUserMenuOnRequestChange={handleUserMenuOnRequestChange}
                    showGooglePlacesBar={showGooglePlacesBar}
                    handleGooglePlacesAutocomplete={(lat, lon, result) =>
                        handleGooglePlacesAutocomplete(lat, lon, result, location.pathname)}
                />
            </MuiThemeProvider>
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app, map, ealgis, snackbars } = state
    return {
        app: app,
        user: ealgis.user,
        snackbars: snackbars,
        debug: map.debug,
    }
}

const mapDispatchToProps = (dispatch: any) => {
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
        handleGooglePlacesAutocomplete: (lat: number, lon: number, result: object, pathname: string) => {
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
