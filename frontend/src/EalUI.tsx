import AppBar from "material-ui/AppBar"
import FlatButton from "material-ui/FlatButton"
import IconButton from "material-ui/IconButton"
import IconMenu from "material-ui/IconMenu"
import LinearProgress from "material-ui/LinearProgress"
import MenuItem from "material-ui/MenuItem"
import Snackbar from "material-ui/Snackbar"
import { ToolbarGroup } from "material-ui/Toolbar"
import { ActionBugReport, ActionExitToApp, ActionFace, ActionInput, ActionSearch } from "material-ui/svg-icons"
import * as React from "react"
import { Link } from "react-router"
import styled from "styled-components"
import { LoginDialog } from "./authentication/login-dialog/LoginDialog"
import { NotApprovedDialog } from "./authentication/not-approved-dialog/NotApprovedDialog"
import { IAppModule, IMUIThemePalette, ISnackbarsModule } from "./redux/modules/interfaces"
import GooglePlacesAutocomplete from "./shared/ui/google-places-autocomplete/GooglePlacesAutocomplete"

const EALGISLogo = styled.img`
    width: 160px;
    padding: 10px;
`

const HiddenIconButton = styled(IconButton)`
    width: 0px !important;
    height: 0px !important;
    padding: 0px !important;
`

const HeaderBarButton = styled(FlatButton)`
    color: #ffffff !important;
    margin: 4px 0px !important;
`

const SearchIconButton = styled(IconButton)`
    padding: 0px !important;
`

export interface IProps {
    muiThemePalette: IMUIThemePalette
    app: IAppModule
    user: any
    snackbars: ISnackbarsModule
    debug: boolean
    showLoginDialog: boolean
    onTapAppBarLeft: any
    handleSnackbarClose: any
    onDebugToggle: any
    onRequestCloseLoginDialog: any
    doLogout: any
    handleShowLoginDialog: any
    handleOpenUserMenu: any
    handleUserMenuOnRequestChange: any
    handleGooglePlacesAutocomplete: any
    content: any
    sidebar: any
    showGooglePlacesBar: boolean
}

export class EalUI extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            app,
            user,
            snackbars,
            debug,
            showLoginDialog,
            onTapAppBarLeft,
            handleSnackbarClose,
            onDebugToggle,
            onRequestCloseLoginDialog,
            doLogout,
            handleShowLoginDialog,
            handleOpenUserMenu,
            handleUserMenuOnRequestChange,
            handleGooglePlacesAutocomplete,
            content,
            sidebar,
            showGooglePlacesBar,
        } = this.props

        const linearProgressStyle = {
            position: "fixed",
            top: "0px",
            zIndex: 1200,
            display: app.requestsInProgress > 0 ? "block" : "none",
        } as any

        return (
            <div className="page">
                <div className="page-header">
                    <LinearProgress mode="indeterminate" color={muiThemePalette.accent3Color} style={linearProgressStyle} />
                    <AppBar
                        title={
                            <EALGISLogo
                                src={require("base64-inline-loader!./assets/brand/ealgis_white_logo_transparent_background_header_bar.png")}
                            />
                        }
                        onLeftIconButtonClick={onTapAppBarLeft}
                        iconElementRight={
                            <ToolbarGroup>
                                {showGooglePlacesBar && (
                                    <React.Fragment>
                                        <SearchIconButton tooltip={"Search for a place or address"}>
                                            <ActionSearch color={"white"} />
                                        </SearchIconButton>

                                        <GooglePlacesAutocomplete
                                            results={handleGooglePlacesAutocomplete}
                                            componentRestrictions={{ country: "AU" }}
                                            inputStyle={{ color: "#ffffff" }}
                                            listStyle={{ width: "100%", maxWidth: "400px", overflow: "hidden" }}
                                            textFieldStyle={{ width: "100%" }}
                                            name={"google-places-autocomplete"}
                                        />
                                    </React.Fragment>
                                )}
                                <HeaderBarButton label="Home" containerElement={<Link to={"/"} />} />
                                <HeaderBarButton label="Maps" containerElement={<Link to={user !== null ? "/maps" : "/shared"} />} />
                                <HeaderBarButton label="About" containerElement={<Link to={"/about"} />} />
                                {user === null && (
                                    <HeaderBarButton
                                        label={"Login/Register"}
                                        icon={<ActionInput color={"white"} />}
                                        onClick={handleShowLoginDialog}
                                    />
                                )}
                                {user !== null && (
                                    <React.Fragment>
                                        <HeaderBarButton
                                            label={user.username}
                                            icon={<ActionFace color={"white"} />}
                                            onClick={handleOpenUserMenu}
                                        />

                                        <IconMenu
                                            iconButtonElement={<HiddenIconButton />}
                                            open={app.userMenuState}
                                            onRequestChange={handleUserMenuOnRequestChange}
                                        >
                                            {user.is_staff && (
                                                <MenuItem
                                                    primaryText={debug ? "Debug Mode: ON" : "Debug Mode: OFF"}
                                                    leftIcon={<ActionBugReport />}
                                                    onClick={onDebugToggle}
                                                />
                                            )}
                                            <MenuItem primaryText="Logout" leftIcon={<ActionExitToApp />} onClick={doLogout} />
                                        </IconMenu>
                                    </React.Fragment>
                                )}
                            </ToolbarGroup>
                        }
                    />
                </div>
                <div className="page-content" style={{ display: app.sidebarOpen ? "flex" : "block" }}>
                    <LoginDialog open={showLoginDialog} onRequestClose={onRequestCloseLoginDialog} />
                    <NotApprovedDialog open={user !== null && !user.is_approved} />
                    <main className="page-main-content">{content || this.props.children}</main>
                    <nav className="page-nav" style={{ display: app.sidebarOpen ? "" : "none" }}>
                        {sidebar || <div />}
                    </nav>
                </div>
                <Snackbar
                    open={snackbars.open}
                    message={snackbars.active.message}
                    action={snackbars.active.action}
                    autoHideDuration={snackbars.active.autoHideDuration}
                    onActionClick={() => {
                        if ("onActionClick" in snackbars.active) {
                            snackbars.active.onActionClick!()
                        }
                    }}
                    onRequestClose={handleSnackbarClose}
                />
            </div>
        )
    }
}

export default EalUI
