import * as React from "react"
import { connect } from "react-redux"
import DataBrowserDialog from "./DataBrowserDialog"
import { withRouter } from "react-router"
import { debounce } from "lodash-es"
import { toggleModalState } from "../../redux/modules/app"
import { change } from "redux-form"
// import { fetchColumnsForTableName } from "../../redux/modules/datasearch"
import {
    selectTables,
    selectColumns,
    searchTables,
    searchTablesByKindAndType,
    searchColumns,
    searchColumnsByKindAndType,
    fetchSingleColumnByKindAndType,
    emptySelectedColumns,
} from "../../redux/modules/databrowser"
import { addColumnToLayerSelection } from "../../redux/modules/maps"
import { loadTable, loadColumn } from "../../redux/modules/ealgis"
import { IStore, ISchemaInfo, ISchema, ITableInfo, ITable, IGeomInfo, IGeomTable, IColumn, ILayer } from "../../redux/modules/interfaces"

import { EALGISApiClient } from "../../shared/api/EALGISApiClient"

interface IProps {}

export interface IStoreProps {
    mapId: number
    layerId: number
    mapNameURLSafe: string
    layer: ILayer
    schemainfo: ISchemaInfo
    tableinfo: ITableInfo
    geominfo: IGeomInfo
    selectedTables: Array<string>
    selectedColumns: Array<IColumn>
    selectedColumn: IColumn
    dataBrowserModalOpen: boolean
    previousPath: string
}

export interface IDispatchProps {
    handleChooseSchema: Function
    handleChooseTable: Function
    handleChooseTableWithPopulation: Function
    onToggleDataBrowserModalState: Function
    showTableView: Function
    handleChooseColumn: Function
    handleExitDataBrowser: Function
}

interface IRouterProps {
    router: any
    route: object
}

interface IRouteProps {
    mapId: number
    mapName: string
    layerId: number
    tabName: string
}

interface IOwnProps {
    params: IRouteProps
}

interface IState {
    selectedSchemas?: Array<string>
    selectedSchemaId?: string
    selectedTable?: ITable
}

export class DataBrowserDialogContainer extends React.Component<
    IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps,
    IState
> {
    constructor(props: IStoreProps & IDispatchProps & IRouterProps) {
        super(props)
        this.state = { selectedSchemas: [] }
        const { handleChooseSchema } = props

        // http://stackoverflow.com/a/24679479/7368493
        this.onTableSearchChangeDebounced = debounce(function(newValue: string) {
            const { selectedSchemaId } = this.state
            handleChooseSchema(selectedSchemaId, newValue)
        }, 500)

        props.router.setRouteLeaveHook(props.route, this.routerWillLeave.bind(this))
    }

    handleSchemaChange(menuItemValue: Array<string>) {
        this.setState({ selectedSchemas: menuItemValue })
    }

    async handleClickSchema(schemaId: string, schema: ISchema) {
        this.setState({ selectedSchemas: [...this.state.selectedSchemas, schema.name], selectedSchemaId: schemaId })
    }

    routerWillLeave(nextLocation: any) {
        this.setState({ selectedSchemas: [], selectedSchemaId: null, selectedTable: null })
        this.props.handleExitDataBrowser()
    }

    render() {
        const {
            mapId,
            layerId,
            mapNameURLSafe,
            layer,
            schemainfo,
            handleChooseSchema,
            tableinfo,
            geominfo,
            selectedTables,
            handleChooseTable,
            handleChooseTableWithPopulation,
            selectedColumns,
            dataBrowserModalOpen,
            onToggleDataBrowserModalState,
            showTableView,
            handleChooseColumn,
            previousPath,
        } = this.props
        const { selectedSchemas } = this.state

        return (
            <DataBrowserDialog
                mapId={mapId}
                layerId={layerId}
                mapNameURLSafe={mapNameURLSafe}
                schemainfo={schemainfo}
                selectedSchemas={selectedSchemas}
                handleSchemaChange={(menuItemValue: Array<string>) => {
                    this.handleSchemaChange(menuItemValue)
                }}
                handleClickSchema={(schemaId: string, schema: ISchema) => {
                    this.handleClickSchema(schemaId, schema)
                    handleChooseSchema(schemaId, "")
                }}
                tableinfo={tableinfo}
                selectedTables={selectedTables}
                selectedTable={this.state.selectedTable}
                selectedTablePopulation={this.state.selectedTablePopulationName}
                handleClickTable={(table: ITable) => {
                    handleChooseTable(table)
                    this.setState({ selectedTable: table })
                }}
                handleClickTableWithPopulation={(table: ITable, tablePopulationName: string) => {
                    handleChooseTableWithPopulation(table, tablePopulationName)
                    this.setState({ selectedTable: table, selectedTablePopulationName: tablePopulationName })
                }}
                selectedColumns={selectedColumns}
                dataBrowserModalOpen={dataBrowserModalOpen}
                onToggleDataBrowserModalState={() => onToggleDataBrowserModalState()}
                backToTableView={() => showTableView()}
                onTableSearchChange={(newValue: string) => this.onTableSearchChangeDebounced(newValue)}
                onChooseColumn={(column: IColumn) => {
                    handleChooseColumn(column, layer["schema"], this.state.selectedTable, mapId, layerId, layer)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { ealgis, databrowser, app, maps } = state
    return {
        mapId: ownProps.params.mapId,
        layerId: ownProps.params.layerId,
        mapNameURLSafe: maps[ownProps.params.mapId]["name-url-safe"],
        layer: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        schemainfo: ealgis.schemainfo,
        tableinfo: ealgis.tableinfo,
        geominfo: ealgis.geominfo,
        selectedTables: databrowser.selectedTables,
        selectedColumns: databrowser.selectedColumns,
        selectedColumn: databrowser.selectedColumn,
        dataBrowserModalOpen: true,
        previousPath: app.previousPath,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        handleChooseSchema: (schemaId: string, searchString: string) => {
            // dispatch(searchTables(["level of education by industry of employment by sex"], [], schemaId))
            dispatch(searchTablesByKindAndType(searchString.split(" "), [], schemaId))
            // dispatch(searchTablesByKindAndType([""], [], schemaId))
        },
        handleChooseTable: (table: ITable) => {
            // FIXME
            if ("is_series" in table) {
                dispatch(searchColumnsByKindAndType(table, ""))
            } else {
                dispatch(searchColumns(table.schema_name, table.name))
            }
        },
        handleChooseTableWithPopulation: (table: ITable, tablePopulationName: string) => {
            dispatch(searchColumnsByKindAndType(table, tablePopulationName))
        },
        onToggleDataBrowserModalState: () => {
            dispatch(toggleModalState("dataBrowser"))
        },
        showTableView: () => {
            dispatch(emptySelectedColumns())
        },
        handleChooseColumn: (
            column: IColumn,
            schema_name: string,
            selectedTable: ITable,
            mapId: number,
            layerId: number,
            layer: ILayer
        ) => {
            const columnPartial: any = { id: column.id, schema: schema_name }

            dispatch(loadColumn(column, schema_name))
            dispatch(loadTable(selectedTable, schema_name))
            dispatch(addColumnToLayerSelection(mapId, layerId, columnPartial))
            dispatch(change("layerForm", "selectedColumns", [...layer.selectedColumns, columnPartial]))
        },
        handleExitDataBrowser: () => {
            dispatch(selectTables([]))
            dispatch(selectColumns([]))
        },
    }
}

const DataBrowserDialogContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataBrowserDialogContainer)

export default withRouter(DataBrowserDialogContainerWrapped)
