import * as React from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import { SocialLoginButton } from './SocialLoginButton';

export interface LoginDialogProps { }
export interface LoginDialogState { open: boolean }

export class LoginDialog extends React.Component<LoginDialogProps, LoginDialogState> {
    state = {
        open: true,
    };
    handleClick() {
        console.log("click!");
    }
    render() {
        const buttonStyle = {
            margin: 12,
            display: 'block',
        };
        return <Dialog title="Log in" modal={true} open={this.state.open}>
            <SocialLoginButton providerName="Facebook" providerUrl="/login/facebook/" />
            <SocialLoginButton providerName="Google" providerUrl="/login/google-oauth2/" />
            <SocialLoginButton providerName="Twitter" providerUrl="/login/twitter/" />
        <div>

        </div>
        </Dialog>;
    }
};