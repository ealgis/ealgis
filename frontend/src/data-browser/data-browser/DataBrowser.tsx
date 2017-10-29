import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"

import { TouchTapEvent } from "material-ui"
import IconButton from "material-ui/IconButton"
import RaisedButton from "material-ui/RaisedButton"
import Subheader from "material-ui/Subheader"
import TextField from "material-ui/TextField"
import NavigationClose from "material-ui/svg-icons/navigation/close"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"

import DataSchemaGrid from "../data-schema-grid/DataSchemaGridContainer"
import DataTableList from "../data-table-list/DataTableListContainer"
import DataColumnTable from "../data-column-table/DataColumnTableContainer"
import { ITable, eTableChooserLayout } from "../../redux/modules/interfaces"

const DataBrowserContainer = styled.div`
    padding: 12px;
    overflow: auto;
`

const DataBrowserToolbar = styled(Toolbar)`background-color: white !important;`

const TableSearchTextField = styled(TextField)`
    margin-left: 15px !important;
    top: -10px !important;
`

export interface IProps {
    mapId: number
    layerId: number
    mapNameURLSafe: string
    dataTableSearchKeywords?: string
    recentTables: Array<Partial<ITable>>
    favouriteTables: Array<Partial<ITable>>
    selectedTables: Array<Partial<ITable>>
    selectedTable?: ITable
    selectedColumns: Array<string>
    handleClickSchema: Function
    onTableSearchChange: Function
    handleClickTable: Function
    onChooseColumn: Function
    onFinishBrowsing: Function
    backToSchemaView: any
    backToTableView: any
}

export class DataBrowser extends React.PureComponent<IProps, {}> {
    showSchemas(selectedTables: any, selectedColumns: any) {
        return selectedTables.length == 0 && selectedColumns.length == 0
    }

    showTables(selectedTables: any, selectedColumns: any) {
        return selectedTables.length > 0 && selectedColumns.length == 0
    }

    showColumns(selectedColumns: any) {
        return selectedColumns.length > 0
    }

    render() {
        const {
            mapId,
            layerId,
            mapNameURLSafe,
            dataTableSearchKeywords,
            recentTables,
            favouriteTables,
            selectedTables,
            selectedTable,
            selectedColumns,
            handleClickSchema,
            onTableSearchChange,
            handleClickTable,
            onChooseColumn,
            backToSchemaView,
            backToTableView,
        } = this.props

        return (
            <DataBrowserContainer>
                <DataBrowserToolbar>
                    <ToolbarGroup firstChild={true}>
                        {this.showTables(selectedTables, selectedColumns) && (
                            <RaisedButton primary={true} label={"Back"} onTouchTap={() => backToSchemaView()} />
                        )}
                        {this.showTables(selectedTables, selectedColumns) && (
                            <TableSearchTextField
                                hintText="e.g. Industry, Family"
                                floatingLabelText="Search for data tables"
                                defaultValue={dataTableSearchKeywords}
                                onChange={(event: object, newValue: string) => onTableSearchChange(newValue)}
                            />
                        )}
                        {this.showColumns(selectedColumns) && (
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

                {this.showSchemas(selectedTables, selectedColumns) && (
                    <div>
                        <Subheader>Recent Tables</Subheader>
                        <DataTableList tables={recentTables} layout={eTableChooserLayout.GRID_LAYOUT} onClickTable={handleClickTable} />

                        <Subheader>Favourite Tables</Subheader>
                        <DataTableList tables={favouriteTables} layout={eTableChooserLayout.GRID_LAYOUT} onClickTable={handleClickTable} />

                        <Subheader>Data Schemas</Subheader>
                        <DataSchemaGrid handleClickSchema={handleClickSchema} />
                    </div>
                )}

                {this.showTables(selectedTables, selectedColumns) && (
                    <DataTableList tables={selectedTables} layout={eTableChooserLayout.LIST_LAYOUT} onClickTable={handleClickTable} />
                )}

                {this.showColumns(selectedColumns) &&
                    selectedTable && (
                        <DataColumnTable table={selectedTable} selectedColumns={selectedColumns} onClickColumn={onChooseColumn} />
                    )}
            </DataBrowserContainer>
        )
    }
}

export default DataBrowser
