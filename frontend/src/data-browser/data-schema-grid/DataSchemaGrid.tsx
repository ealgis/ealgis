import * as React from "react"
import styled from "styled-components"
import { entries as objectEntries } from "core-js/library/fn/object"
import { GridList, GridTile } from "material-ui/GridList"
import { List, ListItem } from "material-ui/List"
import IconButton from "material-ui/IconButton"
import Subheader from "material-ui/Subheader"
import { ActionOpenInNew } from "material-ui/svg-icons"
import { ISchema } from "../../redux/modules/interfaces"
import { Function3 } from "lodash"

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
    schemasByFamily: {
        [key: string]: Array<ISchema>
    }
    handleClickSchema: Function
    handleClickSchemaMoreInfo: Function
}

export class DataSchemaGrid extends React.Component<IProps, {}> {
    render() {
        const { schemasByFamily, handleClickSchema, handleClickSchemaMoreInfo } = this.props

        return (
            <React.Fragment>
                {Object.keys(schemasByFamily).map((family: string) => {
                    return (
                        <React.Fragment key={family}>
                            <Subheader>{family}</Subheader>
                            <List>
                                {schemasByFamily[family].map((schema: ISchema, key: number) => {
                                    return (
                                        <ListItem
                                            key={schema.name}
                                            primaryText={schema.name}
                                            rightIconButton={
                                                <IconButton tooltip="More Info">
                                                    <ActionOpenInNew onClick={() => handleClickSchemaMoreInfo(schema)} />
                                                </IconButton>
                                            }
                                            onClick={() => handleClickSchema(schema)}
                                        />
                                    )
                                })}
                            </List>
                        </React.Fragment>
                    )
                })}
            </React.Fragment>
        )
    }
}

export default DataSchemaGrid
