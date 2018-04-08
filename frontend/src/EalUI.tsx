import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import AppBar from "material-ui/AppBar"
import Snackbar from "material-ui/Snackbar"
import { ToolbarGroup } from "material-ui/Toolbar"
import FlatButton from "material-ui/FlatButton"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import IconButton from "material-ui/IconButton"
import LinearProgress from "material-ui/LinearProgress"
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"
import Toggle from "material-ui/Toggle"
import ActionBugReport from "material-ui/svg-icons/action/bug-report"
import ActionFace from "material-ui/svg-icons/action/face"
import ActionSearch from "material-ui/svg-icons/action/search"
import ActionExitToApp from "material-ui/svg-icons/action/exit-to-app"
import { LoginDialog } from "./authentication/login-dialog/LoginDialog"
import { NotApprovedDialog } from "./authentication/not-approved-dialog/NotApprovedDialog"
import GooglePlacesAutocomplete from "./shared/ui/google-places-autocomplete/GooglePlacesAutocomplete"
import { IAppModule, ISnackbarsModule, IUser, IMUIThemePalette } from "./redux/modules/interfaces"

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
    onTapAppBarLeft: any
    handleSnackbarClose: any
    onDebugToggle: any
    doLogout: any
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
            onTapAppBarLeft,
            handleSnackbarClose,
            onDebugToggle,
            doLogout,
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
        }

        return (
            <div className="page">
                <div className="page-header">
                    <LinearProgress
                        mode="indeterminate"
                        color={muiThemePalette.accent3Color}
                        style={linearProgressStyle}
                    />
                    <AppBar
                        title={
                            <EALGISLogo
                                src={require("base64-inline-loader!./assets/brand/ealgis_white_logo_transparent_background_header_bar.png")}
                            />
                        }
                        onLeftIconButtonClick={onTapAppBarLeft}
                        iconElementRight={
                            <ToolbarGroup>
                                {showGooglePlacesBar &&
                                    <SearchIconButton tooltip={"Search for a place or address"}>
                                        <ActionSearch color={"white"} />
                                    </SearchIconButton>}
                                {showGooglePlacesBar &&
                                    <GooglePlacesAutocomplete
                                        results={handleGooglePlacesAutocomplete}
                                        componentRestrictions={{ country: "AU" }}
                                        inputStyle={{ color: "#ffffff" }}
                                        listStyle={{ width: "100%", maxWidth: "400px", overflow: "hidden" }}
                                        textFieldStyle={{ width: "100%" }}
                                        name={"google-places-autocomplete"}
                                    />}
                                <HeaderBarButton label="Home" containerElement={<Link to={"/"} />} />
                                <HeaderBarButton label="Maps" containerElement={<Link to={"/maps"} />} />
                                <HeaderBarButton label="About" containerElement={<Link to={"/about"} />} />
                                {user !== null &&
                                    <HeaderBarButton
                                        label={user.username}
                                        icon={<ActionFace color={"white"} />}
                                        onClick={handleOpenUserMenu}
                                    />}
                                {user !== null &&
                                    <IconMenu
                                        iconButtonElement={<HiddenIconButton />}
                                        open={app.userMenuState}
                                        onRequestChange={handleUserMenuOnRequestChange}
                                    >
                                        {user.is_staff &&
                                            <MenuItem
                                                primaryText={debug ? "Debug Mode: ON" : "Debug Mode: OFF"}
                                                leftIcon={<ActionBugReport />}
                                                onClick={onDebugToggle}
                                            />}
                                        <MenuItem
                                            primaryText="Logout"
                                            leftIcon={<ActionExitToApp />}
                                            onClick={doLogout}
                                        />
                                    </IconMenu>}
                            </ToolbarGroup>
                        }
                    />
                </div>
                <div className="page-content" style={{ display: app.sidebarOpen ? "flex" : "block" }}>
                    <LoginDialog open={user === null} />
                    <NotApprovedDialog open={user !== null && !user.is_approved} />
                    <main className="page-main-content">
                        {content || this.props.children}
                    </main>
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
