import RaisedButton from "material-ui/RaisedButton"
import * as React from "react"

export interface SocialLoginButtonProps {
    providerName: string
    providerUrl: string
    colour?: string
}
export interface SocialLoginButtonState {}

export class SocialLoginButton extends React.Component<SocialLoginButtonProps, SocialLoginButtonState> {
    handleClick = () => {
        window.location.href = this.props.providerUrl
    }
    render() {
        const { providerName, colour } = this.props

        let colourProps: object = { primary: true }
        if (colour !== undefined) {
            colourProps = {
                backgroundColor: colour,
                labelColor: "#ffffff",
            }
        }

        return (
            <RaisedButton
                label={providerName}
                style={{
                    margin: 12,
                    display: "block",
                }}
                onClick={this.handleClick}
                {...colourProps}
            />
        )
    }
}
