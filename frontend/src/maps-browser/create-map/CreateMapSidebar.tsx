import { ListItem } from "material-ui"
import RaisedButton from "material-ui/RaisedButton"
import { ActionInfo } from "material-ui/svg-icons"
import MapsLayers from "material-ui/svg-icons/maps/layers"
import * as React from "react"
import { Link } from "react-router"
import styled from "styled-components"

const HugeCreateMapButton = styled(RaisedButton)`
    width: 95%;
    margin-left: 10px;
    margin-top: 10px;
`

const HugeCreateMapIcon = styled(MapsLayers)`
    width: 200% !important;
    height: 200% !important;
`

export interface IProps {
    isApprovedUser: boolean
}

export class CreateMap extends React.Component<IProps, {}> {
    render() {
        const { isApprovedUser } = this.props

        return (
            <React.Fragment>
                <HugeCreateMapButton
                    containerElement={isApprovedUser ? <Link to={"/new/map/"} /> : undefined}
                    label="New Map"
                    primary={true}
                    disabled={!isApprovedUser}
                    icon={<MapsLayers />}
                />
                {isApprovedUser === false && (
                    <ListItem primaryText="Register an account to start creating your own maps" leftIcon={<ActionInfo />} disabled={true} />
                )}
            </React.Fragment>
        )
    }
}

export default CreateMap
