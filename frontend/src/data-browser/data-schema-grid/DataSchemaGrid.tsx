import * as React from "react"
import styled from "styled-components"
import { GridList, GridTile } from "material-ui/GridList"
import { ISchema, ISchemaInfo, IMUIThemePalette } from "../../redux/modules/interfaces"

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableGridTile extends React.Component<any, any> {
    render() {
        return <GridTile {...this.props} />
    }
}

const DataSchemaGridTile = styled(ClickableGridTile)`
    background-color: rgba(204, 204, 204, 0.65);
    cursor: pointer;
`

const EALGISLogo = styled.img`
    width: 45%;
    display: block;
    margin: 0 auto;
`

export interface IProps {
    schemainfo: ISchemaInfo
    handleClickSchema: Function
    muiThemePalette: IMUIThemePalette
}

export class DataSchemaGrid extends React.Component<IProps, {}> {
    render() {
        const { schemainfo, handleClickSchema, muiThemePalette } = this.props

        return (
            <GridList cols={5} cellHeight={180} padding={10}>
                {Object.keys(schemainfo).map((schemaId: string, key: number) => {
                    const schema: ISchema = schemainfo[schemaId]
                    return (
                        <DataSchemaGridTile
                            key={key}
                            title={schema.name}
                            subtitle={schema.family}
                            titleBackground={muiThemePalette.accent1Color}
                            onClick={() => handleClickSchema(schemaId, schema)}
                        >
                            <EALGISLogo
                                src={require("base64-inline-loader!../../assets/brand/ealgis_white_logo_only_transparent_background.png")}
                            />
                        </DataSchemaGridTile>
                    )
                })}
            </GridList>
        )
    }
}

export default DataSchemaGrid
