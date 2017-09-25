import * as React from "react"
import { connect } from "react-redux"
import DataTableList from "./DataTableList"
import { IStore, ITable, ITableInfo, ITablesBySchemaAndFamily } from "../../redux/modules/interfaces"

interface IProps {
    selectedTables: Array<string>
    onClickTable: Function
}

export interface IStoreProps {
    // From Props
    tableinfo: ITableInfo
}

export interface IDispatchProps {}

export class DataTableListContainer extends React.PureComponent<IProps & IStoreProps & IDispatchProps, {}> {
    render() {
        const { selectedTables, onClickTable, tableinfo } = this.props

        const tablesBySchemaAndFamily: ITablesBySchemaAndFamily = {}
        for (let tableUID of selectedTables) {
            let table: ITable = tableinfo[tableUID]

            const tableFamilyUID = `${table.schema_name}.${table.metadata_json.family}}`
            if (!(tableFamilyUID in tablesBySchemaAndFamily)) {
                tablesBySchemaAndFamily[tableFamilyUID] = { type: table.metadata_json.type, family: table.metadata_json.family, tables: [] }
            }

            tablesBySchemaAndFamily[tableFamilyUID]["tables"].push(table)
        }

        return <DataTableList tablesBySchemaAndFamily={tablesBySchemaAndFamily} onClickTable={onClickTable} />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { ealgis } = state
    return {
        tableinfo: ealgis.tableinfo,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {}
}

const DataTableListContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataTableListContainer)

export default DataTableListContainerWrapped
