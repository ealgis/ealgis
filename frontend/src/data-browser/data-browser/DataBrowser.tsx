import { Tab, Tabs } from "material-ui"
import IconButton from "material-ui/IconButton"
import { ActionSearch, ContentFilterList, MapsMap, NavigationArrowBack } from "material-ui/svg-icons"
import TextField from "material-ui/TextField"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import * as React from "react"
import styled from "styled-components"
import { eTableChooserLayout, IDataBrowserConfig } from "../../redux/modules/databrowser"
import DataColumnTable from "../data-column-table/DataColumnTableContainer"
import DataSchemaGridContainer from "../data-schema-grid/DataSchemaGridContainer"
import DataSchemaSelectContainer from "../data-schema-select/DataSchemaSelectContainer"
import DataTableList from "../data-table-list/DataTableListContainer"
import { ITable, IColumn, ISchemaInfo } from "../../redux/modules/ealgis";

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableIconButton extends React.Component<any, any> {
    render() {
        return <IconButton {...this.props} />
    }
}

const MasterFlexboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`

const MasterFlexboxItem = styled.div`
    padding-bottom: 56px; /* Height of MasterFlexboxItemBottomFixed */
    height: auto !important; /* Override FixedLayout.css .page-main-content > div > div */
`

const MasterFlexboxItemBottomFixed = styled.div`
    position: absolute;
    bottom: 0;
    width: 2000px; /* Bodge bodge bodge */
    z-index: 1;
    height: auto !important; /* Override FixedLayout.css .page-main-content > div > div */
`

const DataBrowserTitle = styled(ToolbarTitle)`
    color: white;
    padding-left: 10px;
`

const TableSearchTextField = styled(TextField)`
    /* margin-left: 15px !important; */
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
    selectedTab: string
    schemainfo: ISchemaInfo
    handleClickSchema: Function
    onChangeSchemaSelection: Function
    onTableSearchChange: Function
    handleClickTable: Function
    onClickRecentFavouriteOrUsedInThisMapTable: Function
    handleFavouriteTable: Function
    onChooseColumn: Function
    onFinishBrowsing: Function
    backToSchemaView: any
    backToTableList: any
    backToTableView: any
    onChangeTab: any
}

export class DataBrowser extends React.PureComponent<IProps, {}> {
    showSchemas(selectedTables: any, selectedColumns: any) {
        return selectedTables.length === 0 && selectedColumns.length === 0
    }

    showTables(selectedTables: any, selectedColumns: any) {
        return selectedTables.length > 0 && selectedColumns.length === 0
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
            dataTableSearchKeywords,
            recentTables,
            favouriteTables,
            mapTables,
            selectedTables,
            selectedTable,
            selectedColumns,
            activeColumns,
            selectedTab,
            handleClickSchema,
            onChangeSchemaSelection,
            onTableSearchChange,
            handleClickTable,
            onClickRecentFavouriteOrUsedInThisMapTable,
            handleFavouriteTable,
            onChooseColumn,
            onFinishBrowsing,
            backToSchemaView,
            backToTableList,
            backToTableView,
            onChangeTab,
        } = this.props

        let onGoBack
        if (this.showTableSearchResults() && this.showColumns(selectedColumns) === false) {
            onGoBack = backToTableList
        } else if (this.showColumns(selectedColumns)) {
            onGoBack = backToTableView
        } else if (this.showTables(selectedTables, selectedColumns) && this.showTableSearchResults() === false) {
            onGoBack = backToSchemaView
        }

        return (
            <MasterFlexboxContainer>
                <MasterFlexboxItem>
                    <Tabs value={selectedTab} onChange={onChangeTab}>
                        <Tab label="Browse" value="browse">
                            <div style={{ overflowX: "hidden" }}>
                                {this.showSchemas(selectedTables, selectedColumns) && (
                                    <React.Fragment>
                                        <DataSchemaGridContainer handleClickSchema={handleClickSchema} />
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
                            </div>
                        </Tab>

                        <Tab label="In This Map" value="in_this_map">
                            {mapTables.length > 0 && (
                                <DataTableList
                                    tables={mapTables}
                                    layout={eTableChooserLayout.GRID_LAYOUT}
                                    onClickTable={onClickRecentFavouriteOrUsedInThisMapTable}
                                />
                            )}
                        </Tab>

                        <Tab label="Favourites" value="favourites">
                            {favouriteTables.length > 0 && (
                                <DataTableList
                                    tables={favouriteTables}
                                    layout={eTableChooserLayout.GRID_LAYOUT}
                                    onClickTable={onClickRecentFavouriteOrUsedInThisMapTable}
                                />
                            )}
                        </Tab>

                        <Tab label="Used Recently" value="used_recently">
                            {recentTables.length > 0 && (
                                <DataTableList
                                    tables={recentTables}
                                    layout={eTableChooserLayout.GRID_LAYOUT}
                                    onClickTable={onClickRecentFavouriteOrUsedInThisMapTable}
                                />
                            )}
                        </Tab>
                    </Tabs>
                </MasterFlexboxItem>

                <MasterFlexboxItemBottomFixed>
                    <Toolbar>
                        <ToolbarGroup firstChild={true}>
                            <DataBrowserTitle text={"Data Browser"} />

                            {onGoBack !== undefined && (
                                <ClickableIconButton tooltip="Go back" tooltipPosition="top-left" onClick={onGoBack}>
                                    <NavigationArrowBack color={"white"} />
                                </ClickableIconButton>
                            )}
                            <ClickableIconButton
                                tooltip="Close the data browser and return to the map"
                                tooltipPosition="top-left"
                                onClick={onFinishBrowsing}
                            >
                                <MapsMap color={"white"} />
                            </ClickableIconButton>
                            <ToolbarSeparator style={{ backgroundColor: "rgba(255, 255, 255, 0.176)" }} />

                            <ClickableIconButton disableTouchRipple={true} style={{ cursor: "default" }}>
                                <ActionSearch color={"white"} />
                            </ClickableIconButton>
                            <TableSearchTextField
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

                            <ClickableIconButton disableTouchRipple={true} style={{ cursor: "default" }}>
                                <ContentFilterList color={"white"} />
                            </ClickableIconButton>
                            <DataSchemaSelectContainer onChangeSchemaSelection={onChangeSchemaSelection} />
                        </ToolbarGroup>
                    </Toolbar>
                </MasterFlexboxItemBottomFixed>
            </MasterFlexboxContainer>
        )
    }
}

export default DataBrowser
