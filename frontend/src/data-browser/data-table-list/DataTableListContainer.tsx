import * as React from "react"
import { connect } from "react-redux"
import DataTableListBySchemaAndFamily from "./DataTableListBySchemaAndFamily"
import DataTableList from "./DataTableList"
import { IStore, ITable, ITableInfo, ITablesBySchemaAndFamily } from "../../redux/modules/interfaces"
import { eTableChooserLayout } from "../../redux/modules/databrowser"

interface IProps {
    tables: Array<Partial<ITable>>
    layout: eTableChooserLayout
    onClickTable: Function
    onFavouriteTable?: Function
}

export interface IStoreProps {
    // From Props
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
            const tableUID: string = `${table.schema_name}-${table.id}`
            if (tableUID in tableinfo) {
                tablesActual.push(tableinfo[tableUID])
            }
        }
        return tablesActual
    }
    tablesBySchemaAndFamily(tables: Array<ITable>, tableinfo: ITableInfo) {
        const tablesBySchemaAndFamily: ITablesBySchemaAndFamily = {}
        for (var key in tables) {
            let table = tables[key]

            const tableFamilyUID = `${table.schema_name}.${table.metadata_json.family}}`
            if (!(tableFamilyUID in tablesBySchemaAndFamily)) {
                tablesBySchemaAndFamily[tableFamilyUID] = { type: table.metadata_json.type, family: table.metadata_json.family, tables: [] }
            }

            tablesBySchemaAndFamily[tableFamilyUID]["tables"].push(table)
        }
        return tablesBySchemaAndFamily
    }

    render() {
        const { tables, layout, onClickTable, onFavouriteTable, tableinfo, favourite_tables } = this.props
        const tablesActual = this.tablePartialsToFullTable(tables, tableinfo)

        if (layout === eTableChooserLayout.LIST_LAYOUT) {
            const tablesBySchemaAndFamily = this.tablesBySchemaAndFamily(tablesActual, tableinfo)
            return (
                <DataTableListBySchemaAndFamily
                    tablesBySchemaAndFamily={tablesBySchemaAndFamily}
                    favouriteTables={favourite_tables}
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
        tableinfo: ealgis.tableinfo,
        favourite_tables: ealgis.user.favourite_tables,
    }
}

const mapDispatchToProps = (dispatch: Function): any => {}

const DataTableListContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, {})(DataTableListContainer)

export default DataTableListContainerWrapped
