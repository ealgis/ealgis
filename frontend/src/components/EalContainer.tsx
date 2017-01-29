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
    user: string,
    dispatch: Function
}

export class EalContainer extends React.Component<EalContainerProps, undefined> {
    componentDidMount() {
        console.log('componentDidMount')
        const { dispatch } = this.props
        dispatch(fetchUser())
    }

    render() {
        return <MuiThemeProvider>
        <div className="page">
            <div className="page-header">
                <AppBar title="ealgis" />
            </div>
            <div className="page-content">
                <LoginDialog />
                {this.props.children || <p><Link to="/login">Log in</Link></p>}
            </div>
        </div>
        </MuiThemeProvider>;
    }
}

const mapStateToProps = (state: any) => {
    return {
        user: state.user
    }
}

const EalContainerWrapped = connect(
    mapStateToProps
)(EalContainer)

export default EalContainerWrapped