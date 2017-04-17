import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EalUI from "./EalUI";
import { connect } from 'react-redux';
import { fetchUserMapsDataAndColourInfo, receiveSidebarState, addNewSnackbarMessageAndStartIfNeeded, handleIterateSnackbar } from '../actions';
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
    fetchStuff: Function,
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

    render() {
        const { app, user, children, content, sidebar, onTapAppBarLeft, handleRequestClose } = this.props

        if(app.loading === true) {
            return <MuiThemeProvider>
                <CircularProgress style={{marginLeft: "48%", marginTop: "24%"}} />
            </MuiThemeProvider>
        }

        return <MuiThemeProvider>
            <EalUI app={app} user={user} children={children} content={content} sidebar={sidebar} onTapAppBarLeft={onTapAppBarLeft} handleRequestClose={handleRequestClose}></EalUI>
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
    }
  };
}

const EalContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps,
)(EalContainer as any)

export default EalContainerWrapped