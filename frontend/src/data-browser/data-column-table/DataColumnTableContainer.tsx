import * as React from "react"
import { connect } from "react-redux"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import DataColumnTable from "./DataColumnTable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IStore, ISchema, IColumn, ITable, IColumnInfo, ITableColumns } from "../../redux/modules/interfaces"

interface IProps {
    showColumnNames: boolean
    table: ITable
    selectedColumns: Array<string>
    onClickColumn: Function
    onFavouriteTable: Function
}

export interface IStoreProps {
    // From Props
    columninfo: IColumnInfo
    favourite_tables: Array<Partial<ITable>>
    schema: ISchema
}

export interface IDispatchProps {
    onCopyColumnName: Function
}

export interface IState {
    showTableInfo: boolean
}

export class DataColumnTableContainer extends React.PureComponent<IProps & IStoreProps & IDispatchProps, IState> {
    constructor(props: IProps & IStoreProps & IDispatchProps) {
        super(props)
        this.state = { showTableInfo: false }
    }
    render() {
        const {
            showColumnNames,
            table,
            selectedColumns,
            onClickColumn,
            onFavouriteTable,
            onCopyColumnName,
            columninfo,
            favourite_tables,
            schema,
        } = this.props

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
                showColumnNames={showColumnNames}
                schema={schema}
                table={table}
                columns={columns}
                header={header}
                rows={rows}
                showTableInfo={this.state.showTableInfo}
                favouriteTables={favourite_tables}
                onClickColumn={onClickColumn}
                onFavouriteTable={onFavouriteTable}
                onToggleShowInfo={() => {
                    this.setState({ showTableInfo: !this.state.showTableInfo })
                }}
                onCopyColumnName={onCopyColumnName}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { ealgis } = state

    return {
        columninfo: ealgis.columninfo,
        favourite_tables: ealgis.user.favourite_tables,
        schema: ealgis.schemainfo[ownProps.table.schema_name],
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onCopyColumnName: () => {
            dispatch(sendSnackbarNotification(`Column copied to clipboard.`))
        },
    }
}

const DataColumnTableContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataColumnTableContainer)

export default DataColumnTableContainerWrapped
