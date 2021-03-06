import IconButton from "material-ui/IconButton"
import { List, ListItem } from "material-ui/List"
import Subheader from "material-ui/Subheader"
import { ActionOpenInNew } from "material-ui/svg-icons"
import * as React from "react"
import { ISchema } from "../../redux/modules/ealgis";

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
                                                schema.description.startsWith("http") ? (
                                                    <IconButton tooltip="More Info">
                                                        <ActionOpenInNew onClick={() => handleClickSchemaMoreInfo(schema)} />
                                                    </IconButton>
                                                ) : (
                                                    undefined
                                                )
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
