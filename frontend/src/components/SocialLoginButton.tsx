import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export interface SocialLoginButtonProps { providerName: string, providerUrl: string }
export interface SocialLoginButtonState { }

export class SocialLoginButton extends React.Component<SocialLoginButtonProps, SocialLoginButtonState> {
    handleClick = () => {
        console.log("click " + this.props.providerName);
    }
    render() {
        const buttonStyle = {
            margin: 12,
            display: 'block',
        };
        return <RaisedButton label={"Log in with " + this.props.providerName} style={buttonStyle} onTouchTap={this.handleClick}/>;
    }
};