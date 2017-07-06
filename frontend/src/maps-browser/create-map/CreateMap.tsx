import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import RaisedButton from "material-ui/RaisedButton"
import MapsLayers from "material-ui/svg-icons/maps/layers"
import { IMUITheme } from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

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
    muiTheme: IMUITheme
}

export class CreateMap extends React.Component<IProps, {}> {
    render() {
        const { muiTheme } = this.props

        return (
            <HugeCreateMapButton
                containerElement={<Link to={"/new/map/"} />}
                label="New Map"
                secondary={true}
                icon={<MapsLayers />}
            />
        )
    }
}

export default muiThemeable()(CreateMap)
