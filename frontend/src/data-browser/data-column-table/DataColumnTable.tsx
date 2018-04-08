import * as React from "react"
import styled from "styled-components"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import IconButton from "material-ui/IconButton"
import ToggleStar from "material-ui/svg-icons/toggle/star"
import ToggleStarBorder from "material-ui/svg-icons/toggle/star-border"
import ActionViewColumn from "material-ui/svg-icons/action/view-column"
import ActionInfo from "material-ui/svg-icons/action/info"
import { yellow500 } from "material-ui/styles/colors"
import { ISchema, ITablesBySchemaAndFamily, ITableFamily, ITable, ITableColumns } from "../../redux/modules/interfaces"

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableIconButton extends React.Component<any, any> {
    render() {
        return <IconButton {...this.props} />
    }
}

const DataBrowserToolbar = styled(Toolbar)`
    background-color: white !important;
`

const DataBrowserToolbarTitle = styled(ToolbarTitle)`
    color: black;
`

const TableNotes = styled.div`
    padding-bottom: 10px;
`

const MetadataURL = styled.div`
    line-height: 20px;
`

const RowLabelTableHeaderColumn = styled(TableHeaderColumn)`
    width: 250px;
    white-space: normal;
`

const ColumnCellTableHeaderColumn = styled(TableHeaderColumn)`
    white-space: normal !important;
`

const RowLabelTableRowColumn = styled(TableRowColumn)`
    width: 250px;
    white-space: normal !important;
`

const ColumnCellTableRowColumnClickable = styled(TableRowColumn)`
    cursor: pointer;
    border-left: 1px solid rgb(209, 196, 233);
`

const ColumnCellTableRowColumn = styled(TableRowColumn)`
    border-left: 1px solid rgb(209, 196, 233);
`

export interface IProps {
    showColumnNames: boolean
    table: ITable
    columns: ITableColumns
    header: Array<string>
    rows: Array<string>
    showTableInfo: boolean
    favouriteTables: Array<Partial<ITable>>
    onClickColumn: Function
    onFavouriteTable: Function
    onToggleShowInfo: Function
}

export class DataColumnTable extends React.PureComponent<IProps, {}> {
    render() {
        const {
            showColumnNames,
            table,
            columns,
            header,
            rows,
            showTableInfo,
            favouriteTables,
            onClickColumn,
            onFavouriteTable,
            onToggleShowInfo,
        } = this.props
        const favouriteTablesUIDs: any = favouriteTables.map(x => `${x.schema_name}.${x.id}`)

        return (
            <React.Fragment>
                <DataBrowserToolbar>
                    <ToolbarGroup firstChild={true}>
                        <ActionViewColumn style={{ marginRight: "10px" }} />
                        <DataBrowserToolbarTitle
                            text={
                                table["metadata_json"]["series"] === null
                                    ? `${table["metadata_json"]["type"]} (${table["metadata_json"]["family"].toUpperCase()})`
                                    : `${table["metadata_json"]["type"]}: ${table["metadata_json"]["series"]} (${table["metadata_json"][
                                          "family"
                                      ].toUpperCase()})`
                            }
                        />
                    </ToolbarGroup>

                    <ToolbarGroup lastChild={true}>
                        <ClickableIconButton onClick={() => onFavouriteTable(table)}>
                            {arrayIncludes(favouriteTablesUIDs, `${table.schema_name}.${table.id}`) ? (
                                <ToggleStar color={yellow500} />
                            ) : (
                                <ToggleStarBorder />
                            )}
                        </ClickableIconButton>
                        <ClickableIconButton onClick={onToggleShowInfo}>
                            <ActionInfo />
                        </ClickableIconButton>
                    </ToolbarGroup>
                </DataBrowserToolbar>

                {showTableInfo && (
                    <React.Fragment>
                        {table["metadata_json"]["kind"]}
                        <br />
                        <br />
                        <TableNotes dangerouslySetInnerHTML={{ __html: table["metadata_json"]["notes"] }} />
                        {table["metadata_json"]["metadataUrls"].map((obj: any, key: any) => (
                            <MetadataURL key={key}>
                                <a href={obj["url"]} target="_blank">
                                    {obj["name"]}
                                </a>
                            </MetadataURL>
                        ))}
                    </React.Fragment>
                )}

                <Table
                    fixedHeader={true}
                    height={`${window.innerHeight - 200}px`}
                    onCellHover={(rowNumber: any, columnId: any) => {
                        this.setState({ hoverRow: rowNumber, hoverCol: columnId })
                    }}
                    onCellClick={(rowNumber: number, columnId: number, evt?: any) => {
                        const columnUID: string = `${evt.target.dataset.col}.${evt.target.dataset.row}`
                        if (columnUID in columns) {
                            onClickColumn(columns[columnUID])
                        }
                    }}
                >
                    <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                        <TableRow>
                            <RowLabelTableHeaderColumn />
                            {header.map((value: string, idx: number) => {
                                return <ColumnCellTableHeaderColumn key={`${idx}`}>{value}</ColumnCellTableHeaderColumn>
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

                                        return showColumnNames ? (
                                            <ColumnCellTableRowColumn key={`${idxCol}`} data-col={valueCol} data-row={valueRow}>
                                                {!(columnUID in columns) ? "N/A" : columns[columnUID].name}
                                            </ColumnCellTableRowColumn>
                                        ) : (
                                            <ColumnCellTableRowColumnClickable key={`${idxCol}`} data-col={valueCol} data-row={valueRow}>
                                                {!(columnUID in columns) ? "N/A" : ""}
                                            </ColumnCellTableRowColumnClickable>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </React.Fragment>
        )
    }
}

export default DataColumnTable
