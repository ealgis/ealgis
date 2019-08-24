import FlatButton from "material-ui/FlatButton"
import IconButton from "material-ui/IconButton"
import { List, ListItem } from "material-ui/List"
import Subheader from "material-ui/Subheader"
import { ActionDelete, ContentAddBox } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import { IColumn, ISchemaInfo, ITableInfo, ITable, ISchema } from "../../redux/modules/ealgis";

const MultiLineSubheader = styled(Subheader)`
    line-height: 26px !important;
`

export interface IProps {
    columnsByTable: {
        [key: string]: Array<IColumn>
    }
    schemainfo: ISchemaInfo
    tableinfo: ITableInfo
    field: string
    onOpenDataBrowser: any
    onRemoveColumn: any
}

class ExpressionColumnSelector extends React.PureComponent<IProps, {}> {
    render() {
        const { columnsByTable, schemainfo, tableinfo, field, onOpenDataBrowser, onRemoveColumn } = this.props

        const elements: Array<any> = []
        Object.keys(columnsByTable).forEach((table_uid: string) => {
            const table: ITable = tableinfo[table_uid]
            const schema: ISchema = schemainfo[table.schema_name]
            elements.push(
                <MultiLineSubheader key={table_uid}>
                    {table.metadata_json.type} - {schema.name} ({schema.family})
                </MultiLineSubheader>
            )

            columnsByTable[table_uid].forEach((column: IColumn) => {
                elements.push(
                    <ListItem
                        key={column.id}
                        primaryText={`${column.metadata_json.type}, ${column.metadata_json.kind}`}
                        rightIconButton={
                            <IconButton tooltip="Remove column" onClick={() => onRemoveColumn({ colgroup: field, column: column })}>
                                <ActionDelete />
                            </IconButton>
                        }
                    />
                )
            })
        })

        return (
            <React.Fragment>
                <FlatButton
                    key={"add-column-list-item"}
                    label="Add Data"
                    primary={true}
                    icon={<ContentAddBox />}
                    fullWidth={true}
                    onClick={onOpenDataBrowser}
                    style={{ marginBottom: 20 }}
                />

                <List>{elements}</List>
            </React.Fragment>
        )
    }
}

export default ExpressionColumnSelector
