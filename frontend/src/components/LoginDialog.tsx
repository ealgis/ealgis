import * as React from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import { SocialLoginButton } from './SocialLoginButton';

export interface LoginDialogProps { open: boolean }
export interface LoginDialogState { }

export class LoginDialog extends React.Component<LoginDialogProps, LoginDialogState> {
    render() {
        const buttonStyle = {
            margin: 12,
            display: 'block',
        };
        return <Dialog title="Please log in to access EAlGIS" modal={true} open={this.props.open}>
            <SocialLoginButton providerName="Facebook" providerUrl="/login/facebook/" />
            <SocialLoginButton providerName="Google" providerUrl="/login/google-oauth2/" />
            <SocialLoginButton providerName="Twitter" providerUrl="/login/twitter/" />
        </Dialog>;
    }
};