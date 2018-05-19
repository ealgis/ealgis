import IconButton from "material-ui/IconButton"
import RaisedButton from "material-ui/RaisedButton"
import TextField from "material-ui/TextField"
import { Toolbar, ToolbarGroup, ToolbarTitle } from "material-ui/Toolbar"
import { ActionViewColumn, DeviceAccessTime, NavigationClose, ToggleStar } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import { eTableChooserLayout } from "../../redux/modules/databrowser"
import { IColumn, IDataBrowserConfig, ISchemaInfo, ITable } from "../../redux/modules/interfaces"
import DataColumnTable from "../data-column-table/DataColumnTableContainer"
import DataSchemaGridContainer from "../data-schema-grid/DataSchemaGridContainer"
import DataSchemaSelectContainer from "../data-schema-select/DataSchemaSelectContainer"
import DataTableList from "../data-table-list/DataTableListContainer"

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableIconButton extends React.Component<any, any> {
    render() {
        return <IconButton {...this.props} />
    }
}

const DataBrowserContainer = styled.div`
    overflow: auto;
`

const DataBrowserTopToolbar = styled(Toolbar)`
    position: fixed;
    z-index: 1;
    width: 70%;
`

const DataBrowserInnerContainer = styled.div`
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 56px; /* Height of DataBrowserTopToolbar */
`

const DataBrowserSectionContainer = styled.div`
    margin-bottom: 25px;
`

const DataBrowserTitle = styled(ToolbarTitle)`
    color: white;
`

const DataBrowserToolbar = styled(Toolbar)`
    background-color: white !important;
`

const TableSearchTextField = styled(TextField)`
    margin-left: 15px !important;
    top: -10px !important;
    color: white !important;
`

export interface IProps {
    config: IDataBrowserConfig
    mapId: number
    layerId: number
    mapNameURLSafe: string
    dataTableSearchKeywords?: string
    recentTables: Array<Partial<ITable>>
    favouriteTables: Array<Partial<ITable>>
    mapTables: Array<ITable>
    selectedTables: Array<Partial<ITable>>
    selectedTable?: ITable
    selectedColumns: Array<string>
    activeColumns: Array<IColumn>
    schemainfo: ISchemaInfo
    handleClickSchema: Function
    onChangeSchemaSelection: Function
    onTableSearchChange: Function
    handleClickTable: Function
    handleFavouriteTable: Function
    onChooseColumn: Function
    onFinishBrowsing: Function
    backToSchemaView: any
    backToTableList: any
    backToTableView: any
}

export class DataBrowser extends React.PureComponent<IProps, {}> {
    showSchemas(selectedTables: any, selectedColumns: any) {
        return selectedTables.length == 0 && selectedColumns.length == 0
    }

    showTables(selectedTables: any, selectedColumns: any) {
        const { dataTableSearchKeywords } = this.props
        return selectedTables.length > 0 && selectedColumns.length == 0
    }

    showTableSearchResults() {
        const { selectedTables, dataTableSearchKeywords } = this.props
        return selectedTables.length > 0 && dataTableSearchKeywords !== undefined
    }

    showColumns(selectedColumns: any) {
        return selectedColumns.length > 0
    }

    render() {
        const {
            config,
            mapId,
            layerId,
            mapNameURLSafe,
            dataTableSearchKeywords,
            recentTables,
            favouriteTables,
            mapTables,
            selectedTables,
            selectedTable,
            selectedColumns,
            activeColumns,
            handleClickSchema,
            onChangeSchemaSelection,
            onTableSearchChange,
            schemainfo,
            handleClickTable,
            handleFavouriteTable,
            onChooseColumn,
            onFinishBrowsing,
            backToSchemaView,
            backToTableList,
            backToTableView,
        } = this.props

        return (
            <DataBrowserContainer>
                <DataBrowserTopToolbar>
                    <ToolbarGroup firstChild={true}>
                        <DataBrowserTitle text={"Data Browser"} />
                        {this.showTables(selectedTables, selectedColumns) &&
                            this.showTableSearchResults() === false && (
                                <RaisedButton primary={true} label={"Back"} onClick={() => backToSchemaView()} />
                            )}
                        {this.showTableSearchResults() &&
                            this.showColumns(selectedColumns) === false && (
                                <RaisedButton primary={true} label={"Back"} onClick={() => backToTableList()} />
                            )}
                        {(this.showSchemas(selectedTables, selectedColumns) || this.showTables(selectedTables, selectedColumns)) && (
                            <TableSearchTextField
                                hintText="e.g. Industry, Family"
                                floatingLabelText="Search for data"
                                defaultValue={dataTableSearchKeywords}
                                inputStyle={{ color: "white" }}
                                floatingLabelStyle={{ color: "white" }}
                                hintStyle={{ color: "white" }}
                                onKeyPress={(ev: any) => {
                                    if (ev.key === "Enter") {
                                        onTableSearchChange(ev.target.value)
                                    }
                                }}
                            />
                        )}
                        {(this.showSchemas(selectedTables, selectedColumns) || this.showTables(selectedTables, selectedColumns)) && (
                            <DataSchemaSelectContainer onChangeSchemaSelection={onChangeSchemaSelection} />
                        )}
                        {this.showColumns(selectedColumns) && (
                            <RaisedButton primary={true} label={"Back"} onClick={() => backToTableView()} />
                        )}
                    </ToolbarGroup>

                    <ToolbarGroup lastChild={true}>
                        <ClickableIconButton tooltip="Close data browser" tooltipPosition="bottom-left" onClick={onFinishBrowsing}>
                            <NavigationClose color={"white"} />
                        </ClickableIconButton>
                    </ToolbarGroup>
                </DataBrowserTopToolbar>

                <DataBrowserInnerContainer>
                    {this.showSchemas(selectedTables, selectedColumns) && (
                        <React.Fragment>
                            {mapTables.length > 0 && (
                                <DataBrowserSectionContainer>
                                    <DataBrowserToolbar>
                                        <ToolbarGroup>
                                            <ActionViewColumn style={{ marginRight: "10px" }} />
                                            <ToolbarTitle text={"Tables In This Map"} />
                                        </ToolbarGroup>
                                    </DataBrowserToolbar>
                                    <DataTableList
                                        tables={mapTables}
                                        layout={eTableChooserLayout.GRID_LAYOUT}
                                        onClickTable={handleClickTable}
                                    />
                                </DataBrowserSectionContainer>
                            )}

                            <DataBrowserToolbar>
                                <ToolbarGroup>
                                    <ActionViewColumn style={{ marginRight: "10px" }} />
                                    <ToolbarTitle text={"Data Schemas"} />
                                </ToolbarGroup>
                            </DataBrowserToolbar>

                            <DataBrowserSectionContainer>
                                <DataSchemaGridContainer handleClickSchema={handleClickSchema} />
                            </DataBrowserSectionContainer>

                            {recentTables.length > 0 && (
                                <DataBrowserSectionContainer>
                                    <DataBrowserToolbar>
                                        <ToolbarGroup>
                                            <DeviceAccessTime style={{ marginRight: "10px" }} />
                                            <ToolbarTitle text={"Recent Tables"} />
                                        </ToolbarGroup>
                                    </DataBrowserToolbar>
                                    <DataTableList
                                        tables={recentTables}
                                        layout={eTableChooserLayout.GRID_LAYOUT}
                                        onClickTable={handleClickTable}
                                    />
                                </DataBrowserSectionContainer>
                            )}

                            {favouriteTables.length > 0 && (
                                <DataBrowserSectionContainer>
                                    <DataBrowserToolbar>
                                        <ToolbarGroup>
                                            <ToggleStar style={{ marginRight: "10px" }} />
                                            <ToolbarTitle text={"Favourite Tables"} />
                                        </ToolbarGroup>
                                    </DataBrowserToolbar>
                                    <DataTableList
                                        tables={favouriteTables}
                                        layout={eTableChooserLayout.GRID_LAYOUT}
                                        onClickTable={handleClickTable}
                                    />
                                </DataBrowserSectionContainer>
                            )}
                        </React.Fragment>
                    )}

                    {this.showTables(selectedTables, selectedColumns) && (
                        <DataTableList
                            tables={selectedTables}
                            layout={eTableChooserLayout.LIST_LAYOUT}
                            onClickTable={handleClickTable}
                            onFavouriteTable={handleFavouriteTable}
                        />
                    )}

                    {this.showColumns(selectedColumns) &&
                        selectedTable && (
                            <DataColumnTable
                                showColumnNames={config.showColumnNames}
                                table={selectedTable}
                                selectedColumns={selectedColumns}
                                activeColumns={activeColumns}
                                onClickColumn={onChooseColumn}
                                onFavouriteTable={handleFavouriteTable}
                            />
                        )}
                </DataBrowserInnerContainer>
            </DataBrowserContainer>
        )
    }
}

export default DataBrowser
