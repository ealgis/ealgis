import * as React from "react"
import styled from "styled-components"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import { List, ListItem } from "material-ui/List"
import IconButton from "material-ui/IconButton"
import ToggleStar from "material-ui/svg-icons/toggle/star"
import ToggleStarBorder from "material-ui/svg-icons/toggle/star-border"
import { yellow500 } from "material-ui/styles/colors"
import { ISchema, ITablesBySchemaAndFamily, ITableFamily, ITable } from "../../redux/modules/interfaces"

const FlexboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    /* <div> == ListItem */
    & > div {
        flex-grow: 1;
    }

    & > button {
        align-self: flex-start;
    }
`

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableIconButton extends React.Component<any, any> {
    render() {
        return <IconButton {...this.props} />
    }
}

export interface IProps {
    tablesBySchemaAndFamily: ITablesBySchemaAndFamily
    favouriteTables: Array<Partial<ITable>>
    onClickTable: Function
    onFavouriteTable?: Function
}

const isFavourited = (table: ITable, favouriteTablesUIDs: Array<string>) =>
    arrayIncludes(favouriteTablesUIDs, `${table.schema_name}.${table.id}`)

const getTableTitle = (table: ITable, tableFamily: ITableFamily) =>
    `${tableFamily["type"]} (${table["metadata_json"]["family"].toUpperCase()})`

const renderFavouriteIcon = (onFavouriteTable: Function, table: ITable, tableFamily: ITableFamily, favouriteTablesUIDs: Array<string>) =>
    onFavouriteTable !== undefined ? (
        <ClickableIconButton onClick={() => onFavouriteTable(table)}>
            {isFavourited(table, favouriteTablesUIDs) ? <ToggleStar color={yellow500} /> : <ToggleStarBorder />}
        </ClickableIconButton>
    ) : (
        <div />
    )

const renderFavouriteIconForTableFamily = (onFavouriteTable: Function, hasFavouritedTables: boolean) =>
    onFavouriteTable !== undefined ? (
        <ClickableIconButton style={{ cursor: "default" }} disableTouchRipple={true}>
            {hasFavouritedTables ? <ToggleStar color={yellow500} /> : <ToggleStarBorder />}
        </ClickableIconButton>
    ) : (
        <div />
    )

export class DataTableListBySchemaAndFamily extends React.PureComponent<IProps, {}> {
    render() {
        const { tablesBySchemaAndFamily, favouriteTables, onClickTable, onFavouriteTable } = this.props
        const favouriteTablesUIDs: any = favouriteTables.map(x => `${x.schema_name}.${x.id}`)

        return (
            <List>
                {Object.keys(tablesBySchemaAndFamily).map((tableFamilyUID: string, idx: number) => {
                    const tableFamily: ITableFamily = tablesBySchemaAndFamily[tableFamilyUID]

                    if (tableFamily["tables"].length > 1) {
                        const tableUIds = tableFamily["tables"].map((table: ITable) => `${table.schema_name}.${table.id}`)
                        const hasFavouritedTables = favouriteTablesUIDs.some((tableUId: string) => tableUIds.indexOf(tableUId) >= 0)

                        return (
                            <FlexboxContainer key={idx}>
                                {renderFavouriteIconForTableFamily(onFavouriteTable!, hasFavouritedTables)}
                                <ListItem
                                    primaryText={getTableTitle(tableFamily["tables"][0], tableFamily)}
                                    secondaryText={`${tableFamily["tables"][0]["metadata_json"]["kind"]}`}
                                    primaryTogglesNestedList={true}
                                    nestedItems={tableFamily["tables"].map((table: ITable, idx: number) => {
                                        return (
                                            <FlexboxContainer key={idx}>
                                                {renderFavouriteIcon(onFavouriteTable!, table, tableFamily, favouriteTablesUIDs)}
                                                <ListItem
                                                    primaryText={table.metadata_json.series.toUpperCase()}
                                                    onClick={() => onClickTable(table)}
                                                />
                                            </FlexboxContainer>
                                        )
                                    })}
                                />
                            </FlexboxContainer>
                        )
                    } else {
                        const table = tableFamily["tables"][0]
                        return (
                            <FlexboxContainer key={idx}>
                                {renderFavouriteIcon(onFavouriteTable!, table, tableFamily, favouriteTablesUIDs)}
                                <ListItem
                                    primaryText={getTableTitle(table, tableFamily)}
                                    secondaryText={`${table["metadata_json"]["kind"]}` || " "}
                                    onClick={() => onClickTable(table)}
                                />
                            </FlexboxContainer>
                        )
                    }
                })}
            </List>
        )
    }
}

export default DataTableListBySchemaAndFamily
