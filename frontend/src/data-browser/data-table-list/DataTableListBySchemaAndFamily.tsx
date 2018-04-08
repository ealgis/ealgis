import * as React from "react"
import styled from "styled-components"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import { List, ListItem } from "material-ui/List"
import IconButton from "material-ui/IconButton"
import ToggleStar from "material-ui/svg-icons/toggle/star"
import ToggleStarBorder from "material-ui/svg-icons/toggle/star-border"
import { yellow500 } from "material-ui/styles/colors"
import { ISchema, ITablesBySchemaAndFamily, ITableFamily, ITable } from "../../redux/modules/interfaces"

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

export class DataTableListBySchemaAndFamily extends React.PureComponent<IProps, {}> {
    render() {
        const { tablesBySchemaAndFamily, favouriteTables, onClickTable, onFavouriteTable } = this.props
        const favouriteTablesUIDs: any = favouriteTables.map(x => `${x.schema_name}.${x.id}`)

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
                                            onClick={() => onClickTable(table)}
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
                                onClick={() => onClickTable(tableFamily["tables"][0])}
                                rightIconButton={
                                    onFavouriteTable !== undefined ? (
                                        <ClickableIconButton onClick={() => onFavouriteTable(tableFamily["tables"][0])}>
                                            {arrayIncludes(
                                                favouriteTablesUIDs,
                                                `${tableFamily["tables"][0].schema_name}.${tableFamily["tables"][0].id}`
                                            ) ? (
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
                        )
                    }
                })}
            </List>
        )
    }
}

export default DataTableListBySchemaAndFamily
