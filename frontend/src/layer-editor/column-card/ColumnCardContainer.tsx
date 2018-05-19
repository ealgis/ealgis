import * as React from "react"
import { connect } from "react-redux"
import { IColumn, ISelectedColumn, IStore, ITable } from "../../redux/modules/interfaces"
import ColumnCard from "./ColumnCard"

export interface IProps {
    columnStub: ISelectedColumn
    onRemoveColumn: Function
}

export interface IStoreProps {
    column: IColumn
    table: ITable
}

export interface IDispachProps {}

export class ColumnCardContainer extends React.PureComponent<IProps & IStoreProps & IDispachProps, {}> {
    render() {
        const { columnStub, column, table, onRemoveColumn } = this.props

        return <ColumnCard column={column} table={table} onRemoveColumn={() => onRemoveColumn(columnStub)} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { ealgis } = state

    const columnUID = `${ownProps.columnStub["schema"]}.${ownProps.columnStub["id"]}`
    const column: IColumn = ealgis.columninfo[columnUID]
    const tableUID = `${ownProps.columnStub["schema"]}.${column["table_info_id"]}`
    const table: ITable = ealgis.tableinfo[tableUID]

    return {
        column: column,
        table: table,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispachProps => {
    return {}
}

const ColumnCardContainerWrapped = connect<IStoreProps, {}, IProps, IStore>(mapStateToProps, mapDispatchToProps)(ColumnCardContainer)

export default ColumnCardContainerWrapped
