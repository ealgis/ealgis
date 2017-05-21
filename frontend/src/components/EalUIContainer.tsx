import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EalUI from "./EalUI";
import { connect } from 'react-redux';
import { fetchUserMapsDataAndColourInfo, receiveSidebarState, addNewSnackbarMessageAndStartIfNeeded, handleIterateSnackbar, toggleDebugMode, receiveAppPreviousPath, logoutUser, setUserMenuState } from '../actions';
import CircularProgress from 'material-ui/CircularProgress';

import './FixedLayout.css';

export interface EalContainerProps {
    app: object,
    user: any,
    dispatch: Function,
    content: any,
    sidebar: any,
    onTapAppBarLeft: Function,
    handleRequestClose: Function,
    doLogout: Function,
    fetchStuff: Function,
    onDebugToggle: Function,
    location: object,
    onReceiveAppPreviousPath: Function,
    handleOpenUserMenu: Function,
    handleUserMenuOnRequestChange: Function,
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        const { fetchStuff } = this.props
        fetchStuff()

        // Because LiveReload still hardcodes HTTP by default
        // https://github.com/statianzo/webpack-livereload-plugin/issues/23
        if(DEVELOPMENT === true) {
            const script = document.createElement("script");
            script.src = "//localhost:35729/livereload.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }

    componentWillReceiveProps(nextProps: object) {
        // Store the last page in history for navigation/ui that depeneds on knowing that sort of thing
        const { onReceiveAppPreviousPath, location } = this.props
        if(nextProps.location.pathname !== location.pathname) {
            onReceiveAppPreviousPath(location.pathname)
        }
    }

    render() {
        const { app, user, children, content, sidebar, onTapAppBarLeft, handleRequestClose, doLogout, onDebugToggle, handleOpenUserMenu, handleUserMenuOnRequestChange } = this.props

        if(app.loading === true) {
            return <MuiThemeProvider>
                <CircularProgress style={{marginLeft: "48%", marginTop: "24%"}} />
            </MuiThemeProvider>
        }

        return <MuiThemeProvider>
            <EalUI
                app={app}
                user={user}
                children={children}
                content={content}
                sidebar={sidebar}
                onTapAppBarLeft={onTapAppBarLeft}
                handleRequestClose={handleRequestClose}
                doLogout={doLogout}
                onDebugToggle={onDebugToggle}
                handleOpenUserMenu={handleOpenUserMenu}
                handleUserMenuOnRequestChange={handleUserMenuOnRequestChange}
            />
        </MuiThemeProvider>;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app, user } = state
    return {
        app,
        user,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchStuff: () => {
        dispatch(fetchUserMapsDataAndColourInfo())
    },
    onTapAppBarLeft: () => {
        dispatch(receiveSidebarState());
    },
    handleRequestClose: (reason: string) => {
        if(reason === "timeout") {
            dispatch(handleIterateSnackbar())
        }
    },
    onDebugToggle: () => {
        dispatch(toggleDebugMode())
    },
    onReceiveAppPreviousPath: (previousPath: string) => {
        dispatch(receiveAppPreviousPath(previousPath))
    },
    doLogout: () => {
        dispatch(logoutUser())
    },
    handleOpenUserMenu: () => {
        dispatch(setUserMenuState(true))
    },
    handleUserMenuOnRequestChange: (value: boolean) => {
        dispatch(setUserMenuState(value))
    },
  };
}

const EalContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps,
)(EalContainer as any)

export default EalContainerWrapped