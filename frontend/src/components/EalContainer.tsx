import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import { Router, Route, Link, browserHistory } from 'react-router';
import { LoginDialog } from './LoginDialog';
import { connect } from 'react-redux';
import { fetchUser } from '../actions';

import './FixedLayout.css';

export interface EalContainerProps {
    user: any,
    dispatch: Function
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        const { dispatch } = this.props
        dispatch(fetchUser())
    }

    render() {
        const { user } = this.props
        return <MuiThemeProvider>
        <div className="page">
            <div className="page-header">
                <AppBar title={user.username} />
            </div>
            <div className="page-content">
                <LoginDialog open={user.url === null} />
                {this.props.children || <div></div>}
            </div>
        </div>
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