import * as React from "react";
import { Link } from 'react-router';
import AppBar from 'material-ui/AppBar';
import Snackbar from 'material-ui/Snackbar';
import { ToolbarGroup } from 'material-ui/Toolbar';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import { cyanA400 } from 'material-ui/styles/colors';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Toggle from 'material-ui/Toggle';
import ActionBugReport from 'material-ui/svg-icons/action/bug-report';
import ActionFace from 'material-ui/svg-icons/action/face';
import ActionSearch from 'material-ui/svg-icons/action/search';
import SocialSentinmentVeryDissatisfied from 'material-ui/svg-icons/social/sentiment-very-dissatisfied';
import { LoginDialog } from './LoginDialog';
import GooglePlacesAutocomplete from './FormControls/GooglePlacesAutocomplete';

export interface EalUISnackbarNotificationProps {
    message: string,
    key: string,
    action: string,
    autoHideDuration: number,
    onActionTouchTap: any,
}

export interface EalUISnackbarProps {
    open: boolean,
    active: EalUISnackbarNotificationProps,
    messages: Array<EalUISnackbarNotificationProps>,
}

export interface EalUIAppProps {
    loading: boolean,
    sidebarOpen: boolean,
    snackbar: EalUISnackbarProps,
}

export interface EalUIProps {
    app: EalUIAppProps,
    user: any,
    sidebar: any,
    content: any,
    onTapAppBarLeft: any,
    handleRequestClose: any,
    doLogout: Function,
    onDebugToggle: any,
    handleOpenUserMenu: Function,
    handleUserMenuOnRequestChange: Function,
    showGooglePlacesBar: boolean,
    handleGooglePlacesAutocomplete: Function,
}

const styles = {
    hiddenIconButton: {
        width: "0px",
        height: "0px",
        padding: "0px",
    },
    appBarButtonStyle: {
        color: "#ffffff",
        margin: "4px 0px",
    },
    searchIconButton: {
        padding: "0px",
    },
}

export class EalUI extends React.Component<EalUIProps, undefined> {
    render() {
        const { app, user, content, sidebar, onTapAppBarLeft, handleRequestClose, doLogout, onDebugToggle, handleOpenUserMenu, handleUserMenuOnRequestChange, showGooglePlacesBar, handleGooglePlacesAutocomplete } = this.props

        const linearProgressStyle = {
            "position": "fixed",
            "top": "0px",
            "zIndex": 1200,
            "display": app.requestsInProgress > 0 ? "block": "none",
        }

        return <div className="page">
            <div className="page-header">
                <LinearProgress mode="indeterminate" color={cyanA400} style={linearProgressStyle} />
                <AppBar 
                    title="EALGIS"
                    onLeftIconButtonTouchTap={onTapAppBarLeft}
                    iconElementRight={<ToolbarGroup>
                        {showGooglePlacesBar && <IconButton style={styles.searchIconButton} tooltip={"Search for a place or address"}>
                            <ActionSearch color={"white"} />
                        </IconButton>}
                        {showGooglePlacesBar && <GooglePlacesAutocomplete
                            results={handleGooglePlacesAutocomplete}
                            componentRestrictions={{country: "AU"}}
                            inputStyle={{color: "#ffffff"}}
                            listStyle={{width: "100%", maxWidth: "400px", overflow: "hidden"}}
                            textFieldStyle={{width: "100%"}}
                            name={"google-places-autocomplete"}
                        />}
                        <FlatButton label="Home" containerElement={<Link to={"/"} />} style={styles.appBarButtonStyle} />
                        <FlatButton label="Maps" containerElement={<Link to={"/maps"} />} style={styles.appBarButtonStyle} />
                        <FlatButton label="About" containerElement={<Link to={"/about"} />} style={styles.appBarButtonStyle} />
                        {user.id !== null && <FlatButton
                            label={user.username}
                            icon={<ActionFace />}
                            onTouchTap={handleOpenUserMenu}
                            style={styles.appBarButtonStyle}
                        />}
                        {user.id !== null && <IconMenu
                            iconButtonElement={<IconButton style={styles.hiddenIconButton} />}
                            open={app.userMenuState}
                            onRequestChange={handleUserMenuOnRequestChange}
                        >
                            {user.is_staff && <MenuItem
                                primaryText={(app.debug) ? "Debug Mode: ON" : "Debug Mode: OFF"}
                                leftIcon={<ActionBugReport />}
                                onClick={onDebugToggle}
                            />}
                            <MenuItem
                                primaryText="Logout"
                                leftIcon={<SocialSentinmentVeryDissatisfied />}
                                onClick={doLogout}
                            />
                        </IconMenu>}
                    </ToolbarGroup>}
                />
            </div>
            <div className="page-content" style={{"display": app.sidebarOpen ? "flex" : "block"}}>
                <LoginDialog open={user.id === null} />
                <main className="page-main-content">
                    {content || this.props.children}
                </main>
                <nav className="page-nav" style={{"display": app.sidebarOpen ? "" : "none"}}>
                    {sidebar || <div></div>}
                </nav>
            </div>
            <Snackbar
                open={app.snackbar.open}
                message={app.snackbar.active.message}
                action={app.snackbar.active.action}
                autoHideDuration={app.snackbar.active.autoHideDuration}
                onActionTouchTap={() => app.snackbar.active.onActionTouchTap()}
                onRequestClose={handleRequestClose}
            />
        </div>
    }
}

export default EalUI