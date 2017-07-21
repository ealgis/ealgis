import * as React from "react"
import styled from "styled-components"

import { TouchTapEvent } from "material-ui"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import { List, ListItem } from "material-ui/List"
import Subheader from "material-ui/Subheader"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"

import DataSchemaGrid from "../data-schema-grid/DataSchemaGridContainer"
import { ISchemaInfo, ISchema } from "../../redux/modules/interfaces"

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
`

const FirstFlexboxColumn = styled.div`flex: 0 0 12em;`

const SecondFlexboxColumn = styled.div`flex: 1;`

export interface IProps {
    schemainfo: ISchemaInfo
    selectedSchemas: any
    handleSchemaChange: Function
    handleClickSchema: Function
    onToggleDataBrowserModalState: any
    dataBrowserModalOpen: boolean
}

export class MapUINav extends React.Component<IProps, {}> {
    render() {
        const {
            schemainfo,
            selectedSchemas,
            handleSchemaChange,
            handleClickSchema,
            onToggleDataBrowserModalState,
            dataBrowserModalOpen,
        } = this.props

        const dialogActions = [
            <FlatButton label="Close" secondary={true} onTouchTap={onToggleDataBrowserModalState} />,
            <FlatButton label="Add" primary={true} onTouchTap={() => alert("@TODO Add dataset")} />,
        ]

        return (
            <div>
                <Dialog
                    title="Data Browser"
                    actions={dialogActions}
                    modal={true}
                    open={dataBrowserModalOpen}
                    contentStyle={{
                        width: "65%",
                        maxWidth: "none",
                        marginLeft: "25%",
                    }}
                >
                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <List>
                                <ListItem primaryText="Discover" />
                                <ListItem primaryText="Popular" />
                            </List>
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <SelectField
                                hintText="Select a schema"
                                value={selectedSchemas}
                                onChange={(e: TouchTapEvent, index: number, menuItemValue: any) =>
                                    handleSchemaChange(menuItemValue)}
                            >
                                {Object.keys(schemainfo).map((schemaId: string, key: number) => {
                                    const schema: ISchema = schemainfo[schemaId]
                                    return (
                                        <MenuItem
                                            key={schemaId}
                                            insetChildren={true}
                                            checked={selectedSchemas && selectedSchemas.indexOf(schema.name) > -1}
                                            value={schema.name}
                                            primaryText={schema.name}
                                        />
                                    )
                                })}
                            </SelectField>

                            <Subheader>Data Schemas</Subheader>
                            <DataSchemaGrid handleClickSchema={handleClickSchema} />

                            {/* <Subheader>Popular Datasets</Subheader> */}
                        </SecondFlexboxColumn>
                    </FlexboxContainer>
                </Dialog>
            </div>
        )
    }
}

export default MapUINav
