import * as React from "react"
import styled from "styled-components"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import { ListItem } from "material-ui/List"
import IconButton from "material-ui/IconButton"
import ToggleStar from "material-ui/svg-icons/toggle/star"
import ToggleStarBorder from "material-ui/svg-icons/toggle/star-border"
import { yellow500 } from "material-ui/styles/colors"
import { ITableFamily, ITable } from "../../redux/modules/interfaces"

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
    family: ITableFamily
    favouriteTables: Array<string> // schema_name.table_id
    onClickTable: Function
    onFavouriteTable?: Function
}

const isFavourited = (table: ITable, favouriteTables: Array<string>) => arrayIncludes(favouriteTables, `${table.schema_name}.${table.id}`)

const getTableTitle = (table: ITable, tableFamily: ITableFamily) =>
    `${tableFamily["type"]} (${table["metadata_json"]["family"].toUpperCase()})`

const renderFavouriteIcon = (onFavouriteTable: Function, table: ITable, tableFamily: ITableFamily, favouriteTables: Array<string>) =>
    onFavouriteTable !== undefined ? (
        <ClickableIconButton onClick={() => onFavouriteTable(table)}>
            {isFavourited(table, favouriteTables) ? <ToggleStar color={yellow500} /> : <ToggleStarBorder />}
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

export class DataTableListByFamily extends React.PureComponent<IProps, {}> {
    render() {
        const { family, favouriteTables, onClickTable, onFavouriteTable } = this.props

        if (family.tables.length > 1) {
            const tableUIds = family.tables.map((table: ITable) => `${table.schema_name}.${table.id}`)
            const hasFavouritedTables = favouriteTables.some((tableUId: string) => tableUIds.indexOf(tableUId) >= 0)

            return (
                <FlexboxContainer>
                    {renderFavouriteIconForTableFamily(onFavouriteTable!, hasFavouritedTables)}
                    <ListItem
                        primaryText={getTableTitle(family.tables[0], family)}
                        secondaryText={`${family.tables[0]["metadata_json"]["kind"]}`}
                        primaryTogglesNestedList={true}
                        nestedItems={family.tables.map((table: ITable, idx: number) => {
                            return (
                                <FlexboxContainer key={idx}>
                                    {renderFavouriteIcon(onFavouriteTable!, table, family, favouriteTables)}
                                    <ListItem primaryText={table.metadata_json.series.toUpperCase()} onClick={() => onClickTable(table)} />
                                </FlexboxContainer>
                            )
                        })}
                    />
                </FlexboxContainer>
            )
        } else {
            const table = family.tables[0]
            return (
                <FlexboxContainer>
                    {renderFavouriteIcon(onFavouriteTable!, table, family, favouriteTables)}
                    <ListItem
                        primaryText={getTableTitle(table, family)}
                        secondaryText={`${table["metadata_json"]["kind"]}` || " "}
                        onClick={() => onClickTable(table)}
                    />
                </FlexboxContainer>
            )
        }
    }
}

export default DataTableListByFamily
