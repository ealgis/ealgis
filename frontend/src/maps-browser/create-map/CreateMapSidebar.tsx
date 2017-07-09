import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import RaisedButton from "material-ui/RaisedButton"
import MapsLayers from "material-ui/svg-icons/maps/layers"

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
            <HugeCreateMapButton
                containerElement={<Link to={"/new/map/"} />}
                label="New Map"
                secondary={true}
                disabled={!isApprovedUser}
                icon={<MapsLayers />}
            />
        )
    }
}

export default CreateMap
