import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import { Router, Route, Link, browserHistory } from 'react-router';
import { LoginDialog } from './LoginDialog';
import { connect } from 'react-redux';
import { fetchUser, fetchMaps } from '../actions';

import './FixedLayout.css';

export interface EalContainerProps {
    user: any,
    maps: any,
    dispatch: Function
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        const { dispatch } = this.props
        dispatch(fetchUser())
        dispatch(fetchMaps())
    }

    render() {
        const { user, maps } = this.props
        return <MuiThemeProvider>
        <div className="page">
            <div className="page-header">
                <AppBar title={user.username} />
            </div>
            <div className="page-content">
                <LoginDialog open={user.url === null} />
                {this.props.children || <div></div>}
                <ul>
                    {maps.map((m) => <li key={m.id}>{m.name}</li>}
                </ul>
            </div>
        </div>
        </MuiThemeProvider>;
    }
}

const mapStateToProps = (state: any) => {
    const { user, maps } = state
    return {
        user,
        maps
    }
}

const EalContainerWrapped = connect(
    mapStateToProps
)(EalContainer)

export default EalContainerWrapped