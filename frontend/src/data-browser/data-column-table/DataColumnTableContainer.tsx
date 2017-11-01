import * as React from "react"
import { connect } from "react-redux"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import DataColumnTable from "./DataColumnTable"
import { IStore, IColumn, ITable, IColumnInfo, ITableColumns } from "../../redux/modules/interfaces"

interface IProps {
    table: ITable
    selectedColumns: Array<string>
    onClickColumn: Function
    onFavouriteTable: Function
}

export interface IStoreProps {
    // From Props
    columninfo: IColumnInfo
    favourite_tables: Array<Partial<ITable>>
}

export interface IDispatchProps {}

export class DataColumnTableContainer extends React.PureComponent<IProps & IStoreProps & IDispatchProps, {}> {
    render() {
        const { table, selectedColumns, onClickColumn, onFavouriteTable, columninfo, favourite_tables } = this.props

        const columns: ITableColumns = {}
        const header: Array<string> = []
        const rows: Array<string> = []

        for (let columnUID of selectedColumns) {
            let column: IColumn = columninfo[columnUID]

            if (arrayIncludes(header, column["metadata_json"]["kind"]) == false) {
                header.push(column["metadata_json"]["kind"])
            }

            if (arrayIncludes(rows, column["metadata_json"]["type"]) == false) {
                rows.push(column["metadata_json"]["type"])
            }

            columns[`${column["metadata_json"]["kind"]}.${column["metadata_json"]["type"]}`] = column
        }

        return (
            <DataColumnTable
                table={table}
                columns={columns}
                header={header}
                rows={rows}
                favouriteTables={favourite_tables}
                onClickColumn={onClickColumn}
                onFavouriteTable={onFavouriteTable}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { ealgis } = state
    return {
        columninfo: ealgis.columninfo,
        favourite_tables: ealgis.user.favourite_tables,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {}
}

const DataColumnTableContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataColumnTableContainer)

export default DataColumnTableContainerWrapped
