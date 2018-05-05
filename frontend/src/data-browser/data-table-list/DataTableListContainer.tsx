import * as React from "react"
import { connect } from "react-redux"
import DataTableListBySchemaAndTopic from "./DataTableListBySchemaAndTopic"
import DataTableList from "./DataTableList"
import { IStore, ISchemaInfo, ITable, ITableInfo } from "../../redux/modules/interfaces"
import { eTableChooserLayout } from "../../redux/modules/databrowser"

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
        for (var key in tables) {
            const table = tables[key]
            const tableUID: string = `${table.schema_name}.${table.id}`
            if (tableUID in tableinfo) {
                tablesActual.push(tableinfo[tableUID])
            }
        }
        return tablesActual
    }

    getTableSchemas(tables: Array<ITable>) {
        const { schemainfo } = this.props
        return Array.from(new Set(tables.map((table: ITable) => schemainfo[table.schema_name])))
    }

    render() {
        const { tables, layout, onClickTable, onFavouriteTable, tableinfo, favourite_tables } = this.props
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

const DataTableListContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, {})(DataTableListContainer)

export default DataTableListContainerWrapped
