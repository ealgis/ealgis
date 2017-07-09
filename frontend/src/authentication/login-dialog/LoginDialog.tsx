import * as React from "react"
import Dialog from "material-ui/Dialog"
import RaisedButton from "material-ui/RaisedButton"
import { SocialLoginButton } from "../social-login-button/SocialLoginButton"

export interface LoginDialogProps {
    open: boolean
}
export interface LoginDialogState {}

export class LoginDialog extends React.Component<LoginDialogProps, LoginDialogState> {
    render() {
        const { open } = this.props

        return (
            <Dialog title="Please login to access EALGIS" modal={true} open={open}>
                <SocialLoginButton providerName="Facebook" providerUrl="/login/facebook/" colour={"#3B5998"} />
                <SocialLoginButton providerName="Google" providerUrl="/login/google-oauth2/" colour={"#DD4B39"} />
                <SocialLoginButton providerName="Twitter" providerUrl="/login/twitter/" colour={"#55ACEE"} />
            </Dialog>
        )
    }
}
