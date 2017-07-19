import * as React from "react"
import styled from "styled-components"
import {
    deepPurple900,
    deepPurple800,
    deepPurple700,
    deepPurple600,
    deepPurple500,
    deepPurple400,
    deepPurple300,
    deepPurple200,
    deepPurple100,
    white,
    fullBlack,
    yellow500,
} from "material-ui/styles/colors"
import { fade } from "material-ui/utils/colorManipulator"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import EalUI from "./EalUI"
import { connect } from "react-redux"
import { proj } from "openlayers"
import { toggleSidebarState, setLastPage, toggleUserMenu } from "./redux/modules/app"
import { fetchUserMapsDataColourAndSchemaInfo, logoutUser } from "./redux/modules/ealgis"
import { toggleDebugMode, moveToGooglePlacesResult } from "./redux/modules/map"
import { iterate as iterateSnackbar } from "./redux/modules/snackbars"
import CircularProgress from "material-ui/CircularProgress"
import LinearProgress from "material-ui/LinearProgress"
import GoogleMapLoader from "react-google-maps-loader"
import { IStore, IAppModule, ISnackbarsModule, IUser, IMUITheme, IConfig } from "./redux/modules/interfaces"
const Config: IConfig = require("Config") as any

import "./FixedLayout.css"

const muiTheme = getMuiTheme({
    palette: {
        primary1Color: deepPurple500, // AppBar and Tabs, Buttons, Active textfield et cetera
        primary2Color: yellow500, // Whatever this is used for, we don't use that element
        primary3Color: deepPurple100, // Switch background
        accent1Color: deepPurple500, // Active tab highlight colour
        accent2Color: deepPurple400, // Toolbars and switch buttons
        accent3Color: deepPurple300, // Our app LinearProgress bar and Tabs
        textColor: fullBlack,
        alternateTextColor: white, // Buttons and Tabs
        canvasColor: white,
        borderColor: deepPurple100, // Unselected textfield, Divider, et cetera fields
        disabledColor: fade(fullBlack, 0.5), // Unselected textfield et cetera label colour
        pickerHeaderColor: yellow500, // Unused
        clockCircleColor: fade(yellow500, 0.07), // Unused
        shadowColor: fullBlack,
    },
    appBar: {
        height: 50,
    },
})

const EALGISLogo = styled.img`
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 384px;
    height: 226px;
`

export interface IStateProps {
    // From Props
    app: IAppModule
    user: IUser
    snackbars: ISnackbarsModule
    debug: boolean
}

export interface IDispatchProps {
    fetchStuff: Function
    onTapAppBarLeft: Function
    handleSnackbarClose: Function
    onDebugToggle: Function
    onReceiveAppPreviousPath: Function
    doLogout: Function
    handleOpenUserMenu: Function
    handleUserMenuOnRequestChange: Function
    handleGooglePlacesAutocomplete: Function
}

export interface IRouteProps {
    content: any
    sidebar: any
    location: any
}

export class EalContainer extends React.Component<IStateProps & IDispatchProps & IRouteProps, {}> {
    componentDidMount() {
        const { fetchStuff } = this.props
        fetchStuff()
    }

    componentWillReceiveProps(nextProps: IRouteProps) {
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
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div style={{ backgroundColor: muiTheme.palette!.primary1Color, width: "100%", height: "100%" }}>
                        <LinearProgress mode="indeterminate" color={muiTheme.palette!.accent3Color} />
                        <EALGISLogo
                            src={require("base64-inline-loader!./assets/brand/ealgis_white_logo_transparent_background.png")}
                        />
                    </div>
                </MuiThemeProvider>
            )
        }

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <EalUI
                    muiThemePalette={!muiTheme.palette}
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

const mapStateToProps = (state: IStore): IStateProps => {
    const { app, map, ealgis, snackbars } = state

    return {
        app: app,
        user: ealgis.user,
        snackbars: snackbars,
        debug: map.debug,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchStuff: () => {
            dispatch(fetchUserMapsDataColourAndSchemaInfo())
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

const EalContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(EalContainer)

// export default EalContainerWrapped
export default GoogleMapLoader(EalContainerWrapped, {
    libraries: ["places"],
    key: "GOOGLE_MAPS_API_KEY" in Config ? Config["GOOGLE_MAPS_API_KEY"] : "",
})
