import * as React from "react"
import styled from "styled-components"
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import { ISchema, ITablesBySchemaAndFamily, ITableFamily, ITable, ITableColumns } from "../../redux/modules/interfaces"

const RowLabelTableHeaderColumn = styled(TableHeaderColumn)`
    width: 250px;
    white-space: normal;
`

const RowLabelTableRowColumn = styled(TableRowColumn)`
    width: 250px;
    white-space: normal;
`

const ColumnCellTableRowColumn = styled(TableRowColumn)`cursor: pointer;`

export interface IProps {
    table: ITable
    columns: ITableColumns
    header: Array<string>
    rows: Array<string>
    onClickColumn: Function
}

export class DataColumnTable extends React.PureComponent<IProps, {}> {
    render() {
        const { table, columns, header, rows, onClickColumn } = this.props

        return (
            <div>
                <h2>
                    {table["metadata_json"]["series"] === null ? (
                        `${table["metadata_json"]["type"]} (${table["metadata_json"]["family"].toUpperCase()})`
                    ) : (
                        `${table["metadata_json"]["type"]}: ${table["metadata_json"]["series"]} (${table["metadata_json"][
                            "family"
                        ].toUpperCase()})`
                    )}
                </h2>
                <Table
                    fixedHeader={true}
                    height={`${window.innerHeight - 200}px`}
                    onCellHover={(rowNumber: any, columnId: any) => {
                        this.setState({ hoverRow: rowNumber, hoverCol: columnId })
                    }}
                    onCellClick={(rowNumber: number, columnId: number, evt?: any) => {
                        if (evt.target.dataset.disabled !== "true") {
                            onClickColumn(JSON.parse(evt.target.dataset.column))
                        }
                    }}
                >
                    <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                        <TableRow>
                            <RowLabelTableHeaderColumn />
                            {header.map((value: string, idx: number) => {
                                return <RowLabelTableHeaderColumn key={`${idx}`}>{value}</RowLabelTableHeaderColumn>
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {rows.map((valueRow: string, idxRow: number) => {
                            return (
                                <TableRow key={idxRow}>
                                    <RowLabelTableRowColumn>{valueRow}</RowLabelTableRowColumn>
                                    {header.map((valueCol: string, idxCol: number) => {
                                        const columnUID: string = `${valueCol}.${valueRow}`
                                        const cellProps: any = {
                                            key: idxCol,
                                            "data-col": valueCol,
                                            "data-row": valueRow,
                                            "data-disabled": !(columnUID in columns),
                                            "data-column": columnUID in columns ? JSON.stringify(columns[columnUID]) : null,
                                            style: { borderLeft: "1px solid rgb(209, 196, 233)" },
                                        }

                                        return <ColumnCellTableRowColumn {...cellProps} />
                                    })}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        )
    }
}

export default DataColumnTable
