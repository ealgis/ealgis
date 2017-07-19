import * as React from "react"
import styled from "styled-components"
import { GridList, GridTile } from "material-ui/GridList"
import { IMUIThemePalette } from "../../redux/modules/interfaces"

const DataSchemaGridTile = styled(GridTile)`
  background-color: rgba(204, 204, 204, 0.65);
`

const EALGISLogo = styled.img`
    width: 45%;
    display: block;
    margin: 0 auto;
`

export interface IProps {
    muiThemePalette: IMUIThemePalette
}

export class DataSchemaGrid extends React.Component<IProps, {}> {
    render() {
        const { muiThemePalette } = this.props

        return (
            <GridList cols={4} cellHeight={180} padding={10}>
                <DataSchemaGridTile
                    title={"Schema name"}
                    subtitle={"Schema category"}
                    titleBackground={muiThemePalette.accent1Color}
                    cols={1}
                >
                    <EALGISLogo
                        src={require("base64-inline-loader!../../assets/brand/ealgis_white_logo_only_transparent_background.png")}
                    />
                </DataSchemaGridTile>
            </GridList>
        )
    }
}

export default DataSchemaGrid
