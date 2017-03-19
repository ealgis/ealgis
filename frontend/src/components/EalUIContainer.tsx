import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EalUI from "./EalUI";
import { connect } from 'react-redux';
import { fetchUserMapsDataAndColourInfo } from '../actions';
import CircularProgress from 'material-ui/CircularProgress';

import './FixedLayout.css';

export interface EalContainerProps {
    app: object,
    user: any,
    dispatch: Function,
    content: any,
    sidebar: any
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        const { dispatch, app } = this.props
        dispatch(fetchUserMapsDataAndColourInfo())

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
        const { app, user, children, content, sidebar } = this.props
        
        return <MuiThemeProvider>
            {app.loading === true ? 
                <CircularProgress style={{marginLeft: "48%", marginTop: "40%"}} /> : 
                <EalUI user={user} children={children} content={content} sidebar={sidebar}></EalUI>
            }
        </MuiThemeProvider>;
    }
}

const mapStateToProps = (state: any) => {
    const { app, user } = state
    return {
        app,
        user,
    }
}

const EalContainerWrapped = connect(
    mapStateToProps
)(EalContainer)

export default EalContainerWrapped