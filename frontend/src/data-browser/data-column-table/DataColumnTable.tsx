import { includes as arrayIncludes } from "core-js/library/fn/array"
import IconButton from "material-ui/IconButton"
import { yellow500 } from "material-ui/styles/colors"
import { ActionInfo, ActionViewColumn, ToggleStar, ToggleStarBorder } from "material-ui/svg-icons"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import { Toolbar, ToolbarGroup, ToolbarTitle } from "material-ui/Toolbar"
import * as React from "react"
import * as CopyToClipboard from "react-copy-to-clipboard"
import styled from "styled-components"
import { IColumn, IMUIThemePalette, ISchema, ITable, ITableColumns } from "../../redux/modules/interfaces"

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableIconButton extends React.Component<any, any> {
    render() {
        return <IconButton {...this.props} />
    }
}

const DataTableContainer = styled.div`
    overflow: hidden;
`

const DataBrowserToolbar = styled(Toolbar)`
    background-color: white !important;
`

const DataBrowserToolbarTitle = styled(ToolbarTitle)`
    color: black;
`

const TableNotesLink = styled.a`
    padding-bottom: 10px;
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
    cursor: pointer;
    border-left: 1px solid rgb(209, 196, 233);
`

export interface IProps {
    muiThemePalette: IMUIThemePalette
    showColumnNames: boolean
    schema: ISchema
    table: ITable
    columns: ITableColumns
    header: Array<string>
    rows: Array<string>
    selectedColumns: Array<string>
    activeColumns: Array<IColumn>
    showTableInfo: boolean
    favouriteTables: Array<Partial<ITable>>
    onClickColumn: Function
    onFavouriteTable: Function
    onToggleShowInfo: any
    onCopyColumnName: any
}

const isCellNotApplicable = (column: IColumn) => "na" in column.metadata_json && column.metadata_json["na"] === true

export class DataColumnTable extends React.PureComponent<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            showColumnNames,
            schema,
            table,
            columns,
            header,
            rows,
            selectedColumns,
            activeColumns,
            showTableInfo,
            favouriteTables,
            onClickColumn,
            onFavouriteTable,
            onToggleShowInfo,
            onCopyColumnName,
        } = this.props

        const favouriteTablesUIDs: any = favouriteTables.map((table: Partial<ITable>) => `${table.schema_name}.${table.id}`)
        const activeColumnsTypeAndKind: any = activeColumns.map(
            (column: IColumn) => `${column.metadata_json.kind}.${column.metadata_json.type}`
        )

        let toolbarTitle =
            table["metadata_json"]["series"] === null
                ? `${table["metadata_json"]["type"]} (${table["metadata_json"]["family"].toUpperCase()})`
                : `${table["metadata_json"]["type"]}: ${table["metadata_json"]["series"]} (${table["metadata_json"][
                      "family"
                  ].toUpperCase()})`
        toolbarTitle += ` - ${schema.name}, ${schema.family}`

        return (
            <DataTableContainer>
                <DataBrowserToolbar>
                    <ToolbarGroup firstChild={true}>
                        <ActionViewColumn style={{ marginRight: "10px" }} />
                        <DataBrowserToolbarTitle text={toolbarTitle} />
                    </ToolbarGroup>

                    <ToolbarGroup lastChild={true}>
                        <ClickableIconButton
                            onClick={() => onFavouriteTable(table)}
                            tooltip={"Favourite this table to easily find it again later"}
                            tooltipPosition={"bottom-left"}
                        >
                            {arrayIncludes(favouriteTablesUIDs, `${table.schema_name}.${table.id}`) ? (
                                <ToggleStar color={yellow500} />
                            ) : (
                                <ToggleStarBorder />
                            )}
                        </ClickableIconButton>
                        <ClickableIconButton
                            onClick={onToggleShowInfo}
                            tooltip={"Get more information about this data table"}
                            tooltipPosition={"bottom-left"}
                        >
                            <ActionInfo />
                        </ClickableIconButton>
                    </ToolbarGroup>
                </DataBrowserToolbar>
                {table["metadata_json"]["kind"]}{" "}
                <TableNotesLink
                    href=""
                    onClick={(e: any) => {
                        e.preventDefault()
                        onToggleShowInfo()
                    }}
                >
                    more
                </TableNotesLink>
                {showTableInfo && (
                    <React.Fragment>
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
                    // onCellHover={(rowNumber: any, columnId: any) => {
                    //     this.setState({ hoverRow: rowNumber, hoverCol: columnId })
                    // }}
                    onCellClick={(rowNumber: number, columnId: number, evt?: any) => {
                        if (showColumnNames === false) {
                            const columnTypeAndKind: string = `${evt.target.dataset.col}.${evt.target.dataset.row}`
                            if (columnTypeAndKind in columns && isCellNotApplicable(columns[columnTypeAndKind]) === false) {
                                onClickColumn(columns[columnTypeAndKind])
                            }
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
                                        const columnTypeAndKind: string = `${valueCol}.${valueRow}`
                                        const textToCopy =
                                            columnTypeAndKind in columns
                                                ? `${columns[columnTypeAndKind].schema_name}.${columns[columnTypeAndKind].name}`
                                                : ""
                                        let bgColor = arrayIncludes(activeColumnsTypeAndKind, columnTypeAndKind)
                                            ? muiThemePalette.primary1Color
                                            : ""

                                        let cursor = "pointer"
                                        if (isCellNotApplicable(columns[columnTypeAndKind])) {
                                            cursor = "not-allowed"
                                            bgColor = "grey"
                                        }

                                        return showColumnNames ? (
                                            <CopyToClipboard key={`${idxCol}`} text={textToCopy} onCopy={onCopyColumnName}>
                                                <ColumnCellTableRowColumn style={{ backgroundColor: bgColor, cursor: cursor }}>
                                                    {!(columnTypeAndKind in columns) ? "N/A" : columns[columnTypeAndKind].name}
                                                </ColumnCellTableRowColumn>
                                            </CopyToClipboard>
                                        ) : (
                                            <ColumnCellTableRowColumnClickable
                                                key={`${idxCol}`}
                                                data-col={valueCol}
                                                data-row={valueRow}
                                                style={{ backgroundColor: bgColor, cursor: cursor }}
                                            >
                                                {!(columnTypeAndKind in columns) ? "N/A" : ""}
                                            </ColumnCellTableRowColumnClickable>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </DataTableContainer>
        )
    }
}

export default DataColumnTable
