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

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
`

const HighlightedTableRowColumn = styled(TableRowColumn)`
    background-color: rgb(103, 58, 183) !important;
    color: white !important;
`

const NonHighlightedTableRowColumn = styled(TableRowColumn)`background-color: white !important;`

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
    selectedTablePopulation: string
    handleClickTable: Function
    handleClickTableWithPopulation: Function
    selectedColumns: Array<IColumn>
    onToggleDataBrowserModalState: any
    backToSchemaView: any
    backToTableView: any
    onTableSearchChange: Function
    onChooseColumn: Function
    dataBrowserModalOpen: boolean
}

export class MapUINav extends React.Component<IProps, {}> {
    shouldCellBeHighlighted(idxCol: string, idxRow: string) {
        if (this.state === null) {
            return false
        }

        const { hoverCol, hoverRow }: any = this.state

        // Yes, it's in the same column as us
        if (hoverCol == idxCol + 2 && idxRow <= hoverRow) {
            return true
        }

        // Yes, it's in the same row as us
        if (hoverRow == idxRow && idxCol + 2 <= hoverCol) {
            return true
        }
        return false
    }

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
            selectedTablePopulation,
            handleClickTable,
            handleClickTableWithPopulation,
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

        // columnsForTable["header"].reverse()
        // columnsForTable["rows"].reverse()

        // var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
        // columnsForTable["header"].sort(collator.compare)
        // columnsForTable["rows"].sort(collator.compare)
        // if (columnsForTable["rows"].includes("Total")) {
        //     const ttlIndex: number = columnsForTable["rows"].findIndex((value: string) => value == "Total")
        //     columnsForTable["rows"].push(columnsForTable["rows"].splice(ttlIndex, 1))
        // }
        // console.log("columnsForTable", columnsForTable)
        // console.log("columnLookup", columnLookup)

        const dialogActions = [
            <FlatButton label="Close" secondary={true} onTouchTap={onToggleDataBrowserModalState} />,
            <FlatButton label="Add" primary={true} onTouchTap={() => alert("@TODO Add dataset")} />,
        ]

        return (
            <div style={{ padding: "8px", overflow: "auto" }}>
                {/* <Dialog
                    title="Data Browser"
                    actions={dialogActions}
                    modal={true}
                    open={dataBrowserModalOpen}
                    autoScrollBodyContent={true}
                    contentStyle={{
                        width: "65%",
                        maxWidth: "none",
                        marginLeft: "25%",
                    }}
                > */}
                {/* <FlexboxContainer>
                    <FirstFlexboxColumn>
                        <List>
                            <ListItem primaryText="Discoverz" />
                            <ListItem primaryText="Popular" />
                        </List>
                    </FirstFlexboxColumn>

                    <SecondFlexboxColumn> */}

                <Toolbar style={{ backgroundColor: "white", marginBottom: "10px" }}>
                    <ToolbarGroup firstChild={true}>
                        {Object.keys(tablesByType).length > 0 &&
                        columnsForTable["header"].length == 0 && (
                            <div>
                                {/* <SelectField
                                    hintText="Select a schema"
                                    floatingLabelText="Floating Label Text"
                                    value={selectedSchemas}
                                    onChange={(e: TouchTapEvent, index: number, menuItemValue: any) => handleSchemaChange(menuItemValue)}
                                >
                                    {Object.keys(schemainfo).map((schemaId: string, key: number) => {
                                        const schema: ISchema = schemainfo[schemaId]
                                        return (
                                            <MenuItem
                                                key={schemaId}
                                                insetChildren={true}
                                                checked={selectedSchemas && selectedSchemas.indexOf(schema.name) > -1}
                                                value={schema.name}
                                                primaryText={schema.name}
                                            />
                                        )
                                    })}
                                </SelectField> */}
                                <RaisedButton primary={true} onTouchTap={() => backToSchemaView()}>
                                    Back
                                </RaisedButton>
                                <TextField
                                    hintText="e.g. Industry, Family"
                                    floatingLabelText="Search for data tables"
                                    style={{ marginLeft: "15px" }}
                                    value={dataTableSearchKeywords}
                                    onChange={(event: object, newValue: string) => onTableSearchChange(newValue)}
                                />
                            </div>
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
                </Toolbar>

                {Object.keys(tablesByType).length == 0 &&
                columnsForTable["header"].length == 0 && (
                    <div>
                        <Subheader>Data Schemas</Subheader>
                        <DataSchemaGrid handleClickSchema={handleClickSchema} />

                        {/* <Subheader>Popular Datasets</Subheader> */}
                    </div>
                )}

                {/* {Object.keys(tablesByType).length > 0 &&
                    columnsForTable["header"].length == 0 &&
                    <div>
                        <Subheader>Data Tables</Subheader>
                        {Object.keys(tablesByType).map((tableTypeKey: string) => {
                            return (
                                <div key={tableTypeKey}>
                                    <Subheader>
                                        {tablesByType[tableTypeKey]["type"]}
                                    </Subheader>
                                    <GridList cols={3} cellHeight={180} padding={10}>
                                        {tablesByType[tableTypeKey]["tables"].map((table: ITable, index: number) => {
                                            return (
                                                <GridTile
                                                    key={index}
                                                    title={`${table.table_name_from_col} (${table.name})`}
                                                    subtitle={table.metadata_json["kind"]}
                                                    onTouchTap={() => handleClickTable(table)}
                                                />
                                            )
                                        })}
                                    </GridList>
                                </div>
                            )
                        })}
                    </div>} */}

                {Object.keys(tablesByType).length > 0 &&
                columnsForTable["header"].length == 0 && (
                    <div>
                        <Subheader>Data Tables</Subheader>
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
                                                        primaryText={SeriesTable.metadata_json.series}
                                                        style={{ textTransform: "capitalize" }}
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

                {/* {Object.keys(tablesByType).length > 0 &&
                    columnsForTable["header"].length == 0 &&
                    <div>
                        <Subheader>Data Tables</Subheader>
                        <List>
                            {selectedTables.map((TableType: any, idx: number) => {
                                if ("series_tables" in TableType) {
                                    return (
                                        <ListItem
                                            key={idx}
                                            primaryText={TableType["metadata_json"]["type"]}
                                            secondaryText={`${TableType["metadata_json"]["kind"]} (${TableType[
                                                "profile_table"
                                            ]})`}
                                            primaryTogglesNestedList={true}
                                            nestedItems={TableType[
                                                "series_tables"
                                            ].map((tablePopulationName: string, idx: number) => {
                                                return (
                                                    <ListItem
                                                        key={idx}
                                                        primaryText={tablePopulationName.toLowerCase()}
                                                        style={{ textTransform: "capitalize" }}
                                                        onTouchTap={() =>
                                                            handleClickTableWithPopulation(
                                                                TableType,
                                                                tablePopulationName
                                                            )}
                                                    />
                                                )
                                            })}
                                        />
                                    )
                                } else {
                                    return (
                                        <ListItem
                                            key={idx}
                                            primaryText={TableType["metadata_json"]["type"]}
                                            secondaryText={`${TableType["metadata_json"]["kind"]} (${TableType[
                                                "profile_table"
                                            ]})`}
                                            onTouchTap={() => handleClickTable(TableType)}
                                        />
                                    )
                                }
                            })}
                        </List>
                    </div>} */}

                {/* {Object.keys(columnsBySomething).length > 0 &&
                                <div>
                                    <Subheader>Data Columns</Subheader>
                                    {Object.keys(columnsBySomething).map((columnSomethingKey: string) => {
                                        return (
                                            <div key={columnSomethingKey}>
                                                <Subheader>
                                                    {columnSomethingKey}
                                                </Subheader>
                                                <GridList cols={3} cellHeight={180} padding={10}>
                                                    {columnsBySomething[columnSomethingKey][
                                                        "columns"
                                                    ].map((column: IColumn, index: number) => {
                                                        return (
                                                            <GridTile
                                                                key={index}
                                                                title={column.metadata_json.concepts.primary.value}
                                                                subtitle={`${column.metadata_json.concepts.secondary
                                                                    .label} ${column.metadata_json.concepts.secondary
                                                                    .value}`}
                                                            />
                                                        )
                                                    })}
                                                </GridList>
                                            </div>
                                        )
                                    })}
                                </div>} */}

                {columnsForTable["header"].length > 0 && (
                    <div>
                        <h2>
                            {selectedTablePopulation == null ? (
                                `${selectedTable["metadata_json"]["type"]} (${selectedTable["metadata_json"]["family"].toUpperCase()})`
                            ) : (
                                `${selectedTable["metadata_json"]["type"]}: ${selectedTablePopulation} (${selectedTable["metadata_json"][
                                    "family"
                                ].toUpperCase()})`
                            )}
                        </h2>
                        <Table
                            className="DataBrowser"
                            fixedHeader={true}
                            height={window.innerHeight - 200}
                            onCellHover={(rowNumber: any, columnId: any) => {
                                this.setState({ hoverRow: rowNumber, hoverCol: columnId })
                            }}
                            onCellClick={(rowNumber: number, columnId: number, evt: any) => {
                                {
                                    /* console.log(rowNumber, columnId)
                                console.log(evt.target, evt.target.dataset) */
                                }
                                if (evt.target.dataset.disabled !== "true") {
                                    onChooseColumn(JSON.parse(evt.target.dataset.column))
                                }
                            }}
                        >
                            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                                <TableRow>
                                    <TableHeaderColumn style={{ width: "250px" }}>
                                        <RaisedButton secondary={true} onTouchTap={() => backToTableView()}>
                                            Back
                                        </RaisedButton>
                                    </TableHeaderColumn>
                                    {columnsForTable["header"].map((value: string, idx: string) => {
                                        return (
                                            <TableHeaderColumn key={idx} style={{ whiteSpace: "normal" }}>
                                                {value}
                                            </TableHeaderColumn>
                                        )
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody displayRowCheckbox={false} showRowHover={true}>
                                {columnsForTable["rows"].map((valueRow: string, idxRow: string) => {
                                    return (
                                        <TableRow key={idxRow}>
                                            <NonHighlightedTableRowColumn style={{ width: "250px", whiteSpace: "normal" }}>
                                                {valueRow}
                                            </NonHighlightedTableRowColumn>
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

                                                if (this.shouldCellBeHighlighted(idxCol, idxRow)) {
                                                    return <HighlightedTableRowColumn {...cellProps} />
                                                } else {
                                                    return (
                                                        <NonHighlightedTableRowColumn {...cellProps}>
                                                            {!(columnKey in columnLookup) ? "N/A" : ""}
                                                        </NonHighlightedTableRowColumn>
                                                    )
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
            </div>
        )
    }
}

export default MapUINav
