import * as React from "react"
import styled from "styled-components"
import { List, ListItem } from "material-ui/List"
import { ISchema, ITablesBySchemaAndFamily, ITableFamily, ITable } from "../../redux/modules/interfaces"

export interface IProps {
    tablesBySchemaAndFamily: ITablesBySchemaAndFamily
    onClickTable: Function
}

export class DataTableList extends React.PureComponent<IProps, {}> {
    render() {
        const { tablesBySchemaAndFamily, onClickTable } = this.props

        return (
            <List>
                {Object.keys(tablesBySchemaAndFamily).map((tableFamilyUID: string, idx: number) => {
                    const tableFamily: ITableFamily = tablesBySchemaAndFamily[tableFamilyUID]
                    if (tableFamily["tables"].length > 1) {
                        return (
                            <ListItem
                                key={idx}
                                primaryText={`${tableFamily["type"]} (${tableFamily["tables"][0]["metadata_json"][
                                    "family"
                                ].toUpperCase()})`}
                                secondaryText={`${tableFamily["tables"][0]["metadata_json"]["kind"]}`}
                                primaryTogglesNestedList={true}
                                nestedItems={tableFamily["tables"].map((table: ITable, idx: number) => {
                                    return (
                                        <ListItem
                                            key={idx}
                                            primaryText={table.metadata_json.series.toUpperCase()}
                                            onTouchTap={() => onClickTable(table)}
                                        />
                                    )
                                })}
                            />
                        )
                    } else {
                        return (
                            <ListItem
                                key={idx}
                                primaryText={`${tableFamily["type"]} (${tableFamily["tables"][0]["metadata_json"][
                                    "family"
                                ].toUpperCase()})`}
                                secondaryText={`${tableFamily["tables"][0]["metadata_json"]["kind"]}`}
                                onTouchTap={() => onClickTable(tableFamily["tables"][0])}
                            />
                        )
                    }
                })}
            </List>
        )
    }
}

export default DataTableList
