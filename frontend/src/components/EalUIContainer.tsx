import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EalUI from "./EalUI";
import { connect } from 'react-redux';
import { fetchUser, fetchMaps, fetchDataInfo, fetchColourInfo } from '../actions';

import './FixedLayout.css';

export interface EalContainerProps {
    user: any,
    dispatch: Function,
    content: any,
    sidebar: any
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        const { dispatch } = this.props
        dispatch(fetchUser())
        dispatch(fetchMaps())

        // FIXME Should we load this only when needed by LayerForm?
        dispatch(fetchDataInfo())
        dispatch(fetchColourInfo())

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
        const { user, children, content, sidebar } = this.props
        
        return <MuiThemeProvider>
            <EalUI user={user} children={children} content={content} sidebar={sidebar}></EalUI>
        </MuiThemeProvider>;
    }
}

const mapStateToProps = (state: any) => {
    const { user } = state
    return {
        user
    }
}

const EalContainerWrapped = connect(
    mapStateToProps
)(EalContainer)

export default EalContainerWrapped