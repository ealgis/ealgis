import * as React from "react"
import { connect } from "react-redux"
import DataTableListBySchemaAndFamily from "./DataTableListBySchemaAndFamily"
import DataTableList from "./DataTableList"
import { fetchUncachedTables } from "../../redux/modules/ealgis"
import { IStore, ITable, ITableInfo, ITablesBySchemaAndFamily, eTableChooserLayout } from "../../redux/modules/interfaces"

interface IProps {
    tables: Array<Partial<ITable>>
    layout: eTableChooserLayout
    onClickTable: Function
}

export interface IStoreProps {
    // From Props
    tableinfo: ITableInfo
}

export interface IDispatchProps {
    populateAppWithTables: Function
}

export class DataTableListContainer extends React.PureComponent<IProps & IStoreProps & IDispatchProps, {}> {
    componentDidMount() {
        const { tables, populateAppWithTables } = this.props
        if (tables.length > 0 && typeof tables[0] === "object" && Object.keys(tables[0]).length === 2) {
            populateAppWithTables(tables)
        }
    }

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
        const { tables, layout, onClickTable, tableinfo } = this.props
        const tablesActual = this.tablePartialsToFullTable(tables, tableinfo)

        if (layout === eTableChooserLayout.LIST_LAYOUT) {
            const tablesBySchemaAndFamily = this.tablesBySchemaAndFamily(tablesActual, tableinfo)
            return <DataTableListBySchemaAndFamily tablesBySchemaAndFamily={tablesBySchemaAndFamily} onClickTable={onClickTable} />
        } else if (layout === eTableChooserLayout.GRID_LAYOUT) {
            return <DataTableList tables={tablesActual} onClickTable={onClickTable} />
        }

        return <div />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { ealgis } = state

    return {
        tableinfo: ealgis.tableinfo,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        populateAppWithTables(tables: Array<Partial<ITable>>) {
            dispatch(fetchUncachedTables(tables))
        },
    }
}

const DataTableListContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataTableListContainer)

export default DataTableListContainerWrapped
