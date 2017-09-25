import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"

import { TouchTapEvent } from "material-ui"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import IconButton from "material-ui/IconButton"
import RaisedButton from "material-ui/RaisedButton"
import { List, ListItem } from "material-ui/List"
import { GridList, GridTile } from "material-ui/GridList"
import Subheader from "material-ui/Subheader"
import SelectField from "material-ui/SelectField"
import TextField from "material-ui/TextField"
import MenuItem from "material-ui/MenuItem"
import NavigationClose from "material-ui/svg-icons/navigation/close"
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"

import DataSchemaGrid from "../data-schema-grid/DataSchemaGridContainer"
import { ISchemaInfo, ISchema, ITableInfo, ITable, IColumn } from "../../redux/modules/interfaces"

const DataBrowserContainer = styled.div`
    padding: 12px;
    overflow: auto;
`

const DataBrowserToolbar = styled(Toolbar)`
    background-color: white !important;
`

const TableSearchTextField = styled(TextField)`
    margin-left: 15px !important;
    top: -10px !important;
`

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
`

const RowLabelTableHeaderColumn = styled(TableHeaderColumn)`
    width: 250px;
    white-space: normal;
`

const RowLabelTableRowColumn = styled(TableRowColumn)`
    width: 250px;
    white-space: normal;
`

const ColumnCellTableRowColumn = styled(TableRowColumn)`cursor: pointer;`

const FirstFlexboxColumn = styled.div`flex: 0 0 12em;`

const SecondFlexboxColumn = styled.div`flex: 1;`

export interface IProps {
    mapId: number
    layerId: number
    mapNameURLSafe: string
    schemainfo: ISchemaInfo
    selectedSchemas: any
    handleSchemaChange: Function
    handleClickSchema: Function
    tableinfo: ITableInfo
    dataTableSearchKeywords: string
    selectedTables: Array<ITable>
    selectedTable: any
    handleClickTable: Function
    selectedColumns: Array<IColumn>
    onToggleDataBrowserModalState: any
    backToSchemaView: any
    backToTableView: any
    onTableSearchChange: Function
    onChooseColumn: Function
    dataBrowserModalOpen: boolean
}

export class MapUINav extends React.Component<IProps, {}> {
    render() {
        const {
            mapId,
            layerId,
            mapNameURLSafe,
            schemainfo,
            selectedSchemas,
            handleSchemaChange,
            handleClickSchema,
            tableinfo,
            dataTableSearchKeywords,
            selectedTables,
            selectedTable,
            handleClickTable,
            selectedColumns,
            onToggleDataBrowserModalState,
            backToSchemaView,
            backToTableView,
            onTableSearchChange,
            onChooseColumn,
            dataBrowserModalOpen,
        } = this.props

        // console.log("selectedTables", selectedTables)
        // const tablesByType: any = selectedTables

        const tablesByType: any = {}
        for (let tableUID of selectedTables) {
            let table: ITable = tableinfo[tableUID]
            const tableTypeKey = `${table.schema_name}.${table.metadata_json.family}.${table.metadata_json.type.toLowerCase()}`
            if (!(tableTypeKey in tablesByType)) {
                tablesByType[tableTypeKey] = { type: table.metadata_json.type, family: table.metadata_json.family, tables: [] }
            }
            tablesByType[tableTypeKey]["tables"].push(table)
        }
        // console.log("tablesByType", tablesByType)

        const showTotalsOnly = true
        const columnsBySomething: any = {}
        // for (let column of selectedColumns) {
        //     if (showTotalsOnly && column.metadata_json["is_total"] === false) {
        //         continue
        //     }

        //     const theSomething = column.metadata_json["concepts"]["primary"]["value"]
        //     if (!(theSomething in columnsBySomething)) {
        //         columnsBySomething[theSomething] = { type: theSomething, columns: [] }
        //     }
        //     columnsBySomething[theSomething]["columns"].push(column)
        // }
        // console.log("columnsBySomething", columnsBySomething)

        // console.log("selectedColumns", selectedColumns)

        const columnsForTable: any = { header: [], rows: [] }
        const columnsForTable2: any = { header: [], rows: {} }
        const columnLookup: any = {}
        for (let column of selectedColumns) {
            if (columnsForTable["header"].includes(column["metadata_json"]["kind"]) == false) {
                columnsForTable["header"].push(column["metadata_json"]["kind"])
            }

            if (columnsForTable["rows"].includes(column["metadata_json"]["type"]) == false) {
                columnsForTable["rows"].push(column["metadata_json"]["type"])
            }

            columnLookup[`${column["metadata_json"]["kind"]}.${column["metadata_json"]["type"]}`] = column
        }

        const dialogActions = [
            <FlatButton label="Close" secondary={true} onTouchTap={onToggleDataBrowserModalState} />,
            <FlatButton label="Add" primary={true} onTouchTap={() => alert("@TODO Add dataset")} />,
        ]

        return (
            <DataBrowserContainer>
                <DataBrowserToolbar>
                    <ToolbarGroup firstChild={true}>
                        {Object.keys(tablesByType).length > 0 &&
                        columnsForTable["header"].length == 0 && (
                            <RaisedButton primary={true} label={"Back"} onTouchTap={() => backToSchemaView()} />
                        )}
                        {Object.keys(tablesByType).length > 0 &&
                        columnsForTable["header"].length == 0 && (
                            <TableSearchTextField
                                hintText="e.g. Industry, Family"
                                floatingLabelText="Search for data tables"
                                value={dataTableSearchKeywords}
                                onChange={(event: object, newValue: string) => onTableSearchChange(newValue)}
                            />
                        )}
                        {columnsForTable["header"].length > 0 && (
                            <RaisedButton primary={true} label={"Back"} onTouchTap={() => backToTableView()} />
                        )}
                    </ToolbarGroup>

                    <ToolbarGroup lastChild={true}>
                        <IconButton
                            tooltip="Close data browser"
                            tooltipPosition="bottom-left"
                            containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                        >
                            <NavigationClose />
                        </IconButton>
                    </ToolbarGroup>
                </DataBrowserToolbar>

                {Object.keys(tablesByType).length == 0 &&
                columnsForTable["header"].length == 0 && (
                    <div>
                        <Subheader>Data Schemas</Subheader>
                        <DataSchemaGrid handleClickSchema={handleClickSchema} />
                    </div>
                )}

                {Object.keys(tablesByType).length > 0 &&
                columnsForTable["header"].length == 0 && (
                    <div>
                        <List>
                            {Object.keys(tablesByType).map((tableTypeKey: string, idx: number) => {
                                if (tablesByType[tableTypeKey]["tables"].length > 1) {
                                    return (
                                        <ListItem
                                            key={idx}
                                            primaryText={`${tablesByType[tableTypeKey]["type"]} (${tablesByType[tableTypeKey]["tables"][0][
                                                "metadata_json"
                                            ]["family"].toUpperCase()})`}
                                            secondaryText={`${tablesByType[tableTypeKey]["tables"][0]["metadata_json"]["kind"]}`}
                                            primaryTogglesNestedList={true}
                                            nestedItems={tablesByType[tableTypeKey]["tables"].map((SeriesTable: ITable, idx: number) => {
                                                return (
                                                    <ListItem
                                                        key={idx}
                                                        primaryText={SeriesTable.metadata_json.series.toUpperCase()}
                                                        onTouchTap={() => handleClickTable(SeriesTable)}
                                                    />
                                                )
                                            })}
                                        />
                                    )
                                } else {
                                    return (
                                        <ListItem
                                            key={idx}
                                            primaryText={`${tablesByType[tableTypeKey]["type"]} (${tablesByType[tableTypeKey]["tables"][0][
                                                "metadata_json"
                                            ]["family"].toUpperCase()})`}
                                            secondaryText={`${tablesByType[tableTypeKey]["tables"][0]["metadata_json"]["kind"]}`}
                                            onTouchTap={() => handleClickTable(tablesByType[tableTypeKey]["tables"][0])}
                                        />
                                    )
                                }
                            })}
                        </List>
                    </div>
                )}

                {columnsForTable["header"].length > 0 && (
                    <div>
                        <h2>
                            {selectedTable["metadata_json"]["series"] === null ? (
                                `${selectedTable["metadata_json"]["type"]} (${selectedTable["metadata_json"]["family"].toUpperCase()})`
                            ) : (
                                `${selectedTable["metadata_json"]["type"]}: ${selectedTable["metadata_json"]["series"]} (${selectedTable[
                                    "metadata_json"
                                ]["family"].toUpperCase()})`
                            )}
                        </h2>
                        <Table
                            className="DataBrowser"
                            fixedHeader={true}
                            height={`${window.innerHeight - 200}px`}
                            onCellHover={(rowNumber: any, columnId: any) => {
                                this.setState({ hoverRow: rowNumber, hoverCol: columnId })
                            }}
                            onCellClick={(rowNumber: number, columnId: number, evt: any) => {
                                if (evt.target.dataset.disabled !== "true") {
                                    onChooseColumn(JSON.parse(evt.target.dataset.column))
                                }
                            }}
                        >
                            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                                <TableRow>
                                    <RowLabelTableHeaderColumn />
                                    {columnsForTable["header"].map((value: string, idx: string) => {
                                        return (
                                            <RowLabelTableHeaderColumn key={idx}>
                                                {value}
                                            </RowLabelTableHeaderColumn>
                                        )
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody displayRowCheckbox={false}>
                                {columnsForTable["rows"].map((valueRow: string, idxRow: string) => {
                                    return (
                                        <TableRow key={idxRow}>
                                            <RowLabelTableRowColumn>
                                                {valueRow}
                                            </RowLabelTableRowColumn>
                                            {columnsForTable["header"].map((valueCol: string, idxCol: string) => {
                                                const columnKey: string = `${valueCol}.${valueRow}`
                                                const cellProps: any = {
                                                    key: idxCol,
                                                    "data-col": valueCol,
                                                    "data-row": valueRow,
                                                    "data-disabled": !(columnKey in columnLookup),
                                                    "data-column":
                                                        columnKey in columnLookup ? JSON.stringify(columnLookup[columnKey]) : null,
                                                    style: { borderLeft: "1px solid rgb(209, 196, 233)" },
                                                }

                                                return <ColumnCellTableRowColumn {...cellProps} />
                                                }
                                            })}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {}
                {}
            </DataBrowserContainer>
        )
    }
}

export default MapUINav
