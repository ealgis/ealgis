import * as React from "react"
import styled from "styled-components"
import { List, ListItem } from "material-ui/List"
import { GridList, GridTile } from "material-ui/GridList"
import { ISchema, ITablesBySchemaAndFamily, ITableFamily, ITable } from "../../redux/modules/interfaces"

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableGridTile extends React.Component<any, any> {
    render() {
        return <GridTile {...this.props} />
    }
}

export interface IProps {
    tables: Array<ITable>
    onClickTable: Function
}

export class DataTableList extends React.PureComponent<IProps, {}> {
    getTableName(table: ITable) {
        if (table["metadata_json"]["series"] !== null) {
            return `${table["metadata_json"]["type"]} - ${table["metadata_json"]["series"]} (${table["metadata_json"][
                "family"
            ].toUpperCase()})`
        } else {
            return `${table["metadata_json"]["type"]} (${table["metadata_json"]["family"].toUpperCase()})`
        }
    }
    render() {
        const { tables, onClickTable } = this.props

        return (
            <GridList cols={6} cellHeight={"auto"} padding={10}>
                {tables.map((table: ITable, idx: number) => {
                    return (
                        <ClickableGridTile key={idx} cols={2} onClick={() => onClickTable(table)}>
                            <ListItem
                                primaryText={this.getTableName(table)}
                                secondaryText={`${table["metadata_json"]["kind"]}`}
                                secondaryTextLines={2}
                            />
                        </ClickableGridTile>
                    )
                })}
            </GridList>
        )
    }
}

export default DataTableList
