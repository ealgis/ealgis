import * as React from "react"
import styled from "styled-components"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import { List, ListItem } from "material-ui/List"
import { GridList, GridTile } from "material-ui/GridList"
import IconButton from "material-ui/IconButton"
import ToggleStar from "material-ui/svg-icons/toggle/star"
import ToggleStarBorder from "material-ui/svg-icons/toggle/star-border"
import { yellow500 } from "material-ui/styles/colors"
import { ISchema, ITablesBySchemaAndFamily, ITableFamily, ITable } from "../../redux/modules/interfaces"

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableGridTile extends React.Component<any, any> {
    render() {
        return <GridTile {...this.props} />
    }
}

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableIconButton extends React.Component<any, any> {
    render() {
        return <IconButton {...this.props} />
    }
}

export interface IProps {
    tables: Array<ITable>
    favouriteTables: Array<Partial<ITable>>
    onClickTable: Function
    onFavouriteTable?: Function
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
        const { tables, favouriteTables, onClickTable, onFavouriteTable } = this.props
        const favouriteTablesUIDs: any = favouriteTables.map(x => `${x.schema_name}.${x.id}`)

        return (
            <GridList cols={6} cellHeight={"auto"} padding={10}>
                {tables.map((table: ITable, idx: number) => {
                    return (
                        <ClickableGridTile key={idx} cols={2} onClick={() => onClickTable(table)}>
                            <ListItem
                                primaryText={this.getTableName(table)}
                                secondaryText={`${table["metadata_json"]["kind"]}`}
                                secondaryTextLines={2}
                                rightIconButton={
                                    onFavouriteTable !== undefined ? (
                                        <ClickableIconButton onClick={() => onFavouriteTable(table)}>
                                            {arrayIncludes(favouriteTablesUIDs, `${table.schema_name}.${table.id}`) ? (
                                                <ToggleStar color={yellow500} />
                                            ) : (
                                                <ToggleStarBorder />
                                            )}
                                        </ClickableIconButton>
                                    ) : (
                                        undefined
                                    )
                                }
                            />
                        </ClickableGridTile>
                    )
                })}
            </GridList>
        )
    }
}

export default DataTableList
