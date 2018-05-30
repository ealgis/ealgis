import { includes as arrayIncludes } from "core-js/library/fn/array"
import * as React from "react"
import { connect } from "react-redux"
import { eTableChooserLayout } from "../../redux/modules/databrowser"
import { ISchemaInfo, IStore, ITable, ITableInfo } from "../../redux/modules/interfaces"
import DataTableList from "./DataTableList"
import DataTableListBySchemaAndTopic from "./DataTableListBySchemaAndTopic"

interface IProps {
    tables: Array<Partial<ITable>>
    layout: eTableChooserLayout
    onClickTable: Function
    onFavouriteTable?: Function
}

export interface IStoreProps {
    schemainfo: ISchemaInfo
    tableinfo: ITableInfo
    favourite_tables: Array<Partial<ITable>>
}

export interface IDispatchProps {}

export class DataTableListContainer extends React.PureComponent<IProps & IStoreProps & IDispatchProps, {}> {
    tablePartialsToFullTable(tables: Array<Partial<ITable>>, tableinfo: ITableInfo): Array<ITable> {
        const tablesActual: Array<ITable> = []
        const tableinfoUIDs: Array<string> = Object.keys(tableinfo)
        const tableFamilies: Array<string> = []

        // Turn out partial table objects (id + schema_name) into
        // fully ITable objects, and deduplicate them based on table
        // family (i.e. if a map uses a table from the same family twice
        // then we'll only display it once)
        for (var key in tables) {
            const tableUID = `${tables[key].schema_name}.${tables[key].id}`
            if (tableUID in tableinfo) {
                const table = tableinfo[tableUID]

                // If the table has a family then it is not unique in its schema (it will exist for multiple geometries)
                // Families must be unique within a schema - i.e. one family = one set of tables representing a dataset
                if ("family" in table.metadata_json) {
                    const tableFamilyUID = `${table.schema_name}.${table.metadata_json.family}`
                    if (arrayIncludes(tableFamilies, tableFamilyUID) === false) {
                        tableFamilies.push(tableFamilyUID)
                        tablesActual.push(table)
                    }
                } else {
                    // If the table has no families then it is considered unique within its schema
                    tablesActual.push(table)
                }
            }
        }

        return tablesActual
    }

    getTableSchemas(tables: Array<ITable>) {
        const { schemainfo } = this.props
        return Array.from(new Set(tables.map((table: ITable) => schemainfo[table.schema_name])))
    }

    render() {
        const { tables, layout, onClickTable, onFavouriteTable, schemainfo, tableinfo, favourite_tables } = this.props
        const tablesActual = this.tablePartialsToFullTable(tables, tableinfo)

        if (layout === eTableChooserLayout.LIST_LAYOUT) {
            const tableSchemas = this.getTableSchemas(tablesActual)
            const favouriteTablesUIDs: Array<string> = favourite_tables.map(t => `${t.schema_name}.${t.id}`)

            return (
                <DataTableListBySchemaAndTopic
                    schemas={tableSchemas}
                    tables={tablesActual}
                    favouriteTables={favouriteTablesUIDs}
                    onClickTable={onClickTable}
                    onFavouriteTable={onFavouriteTable}
                />
            )
        } else if (layout === eTableChooserLayout.GRID_LAYOUT) {
            return (
                <DataTableList
                    schemas={schemainfo}
                    tables={tablesActual}
                    favouriteTables={favourite_tables}
                    onClickTable={onClickTable}
                    onFavouriteTable={onFavouriteTable}
                />
            )
        }

        return <div />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { ealgis } = state

    return {
        schemainfo: ealgis.schemainfo,
        tableinfo: ealgis.tableinfo,
        favourite_tables: ealgis.user.favourite_tables,
    }
}

const mapDispatchToProps = (dispatch: Function): any => {}

const DataTableListContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, {})(DataTableListContainer)

export default DataTableListContainerWrapped
