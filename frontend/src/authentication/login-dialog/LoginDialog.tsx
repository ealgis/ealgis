import Dialog from "material-ui/Dialog"
import * as React from "react"
import { IConfig } from "../../redux/modules/interfaces"
import { SocialLoginButton } from "../social-login-button/SocialLoginButton"
declare var Config: IConfig

export interface LoginDialogProps {
    open: boolean
    onRequestClose: any
}
export interface LoginDialogState {}

export class LoginDialog extends React.Component<LoginDialogProps, LoginDialogState> {
    render() {
        const { open, onRequestClose } = this.props

        return (
            <Dialog title="Please login to access EALGIS" modal={false} open={open} onRequestClose={onRequestClose}>
                {Config["AUTH_PROVIDERS"]["GOOGLE"] === true && (
                    <SocialLoginButton providerName="Google" providerUrl="/login/google-oauth2/" colour={"#DD4B39"} />
                )}
                {Config["AUTH_PROVIDERS"]["FACEBOOK"] === true && (
                    <SocialLoginButton providerName="Facebook" providerUrl="/login/facebook/" colour={"#3B5998"} />
                )}
                {Config["AUTH_PROVIDERS"]["TWITTER"] === true && (
                    <SocialLoginButton providerName="Twitter" providerUrl="/login/twitter/" colour={"#55ACEE"} />
                )}
                {Config["AUTH_PROVIDERS"]["CUSTOM_OAUTH2"] !== null && (
                    <SocialLoginButton
                        providerName={Config["AUTH_PROVIDERS"]["CUSTOM_OAUTH2"]!["title"]}
                        providerUrl={`/login/${Config["AUTH_PROVIDERS"]["CUSTOM_OAUTH2"]!["name"]}/`}
                    />
                )}
            </Dialog>
        )
    }
}
