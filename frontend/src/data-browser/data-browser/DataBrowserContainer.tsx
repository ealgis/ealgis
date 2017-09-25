import * as React from "react"
import { connect } from "react-redux"
import DataBrowser from "./DataBrowser"
import { withRouter } from "react-router"
import { debounce } from "lodash-es"
import { change } from "redux-form"
import { searchTables, fetchColumns, emptySelectedTables, emptySelectedColumns } from "../../redux/modules/databrowser"
import { addColumnToLayerSelection } from "../../redux/modules/maps"
import { loadTable, loadColumn } from "../../redux/modules/ealgis"
import { IStore, ISchema, ITable, ISelectedColumn, IGeomTable, IColumn, ILayer } from "../../redux/modules/interfaces"

import { EALGISApiClient } from "../../shared/api/EALGISApiClient"

interface IProps {}

export interface IStoreProps {
    mapId: number
    layerId: number
    mapNameURLSafe: string
    layer: ILayer
    geometry: IGeomTable
    selectedTables: Array<string>
    selectedColumns: Array<string>
    selectedColumn: IColumn
}

export interface IDispatchProps {
    handleChooseSchema: Function
    handleChooseTable: Function
    showSchemaView: Function
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
    selectedSchemaId?: string
    dataTableSearchKeywords?: string
    selectedTable?: ITable
}

export class DataBrowserContainer extends React.Component<IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps, IState> {
    self: DataBrowserContainer = this
    onTableSearchChangeDebounced: Function

    constructor(props: IStoreProps & IDispatchProps & IRouterProps) {
        super(props)
        this.state = {}
        const { handleChooseSchema, geometry } = props

        // http://stackoverflow.com/a/24679479/7368493
        this.onTableSearchChangeDebounced = debounce(function(newValue: string, selectedSchemaId: string) {
            handleChooseSchema(selectedSchemaId, newValue, geometry)
        }, 500)

        props.router.setRouteLeaveHook(props.route, this.routerWillLeave.bind(this))
    }

    routerWillLeave(nextLocation: any) {
        this.setState({ selectedSchemaId: undefined, dataTableSearchKeywords: undefined, selectedTable: undefined })
        this.props.handleExitDataBrowser()
    }

    render() {
        const {
            mapId,
            layerId,
            mapNameURLSafe,
            layer,
            geometry,
            handleChooseSchema,
            selectedTables,
            handleChooseTable,
            selectedColumns,
            showTableView,
            showSchemaView,
            handleChooseColumn,
        } = this.props

        return (
            <DataBrowser
                mapId={mapId}
                layerId={layerId}
                mapNameURLSafe={mapNameURLSafe}
                dataTableSearchKeywords={this.state.dataTableSearchKeywords}
                selectedTables={selectedTables}
                selectedTable={this.state.selectedTable}
                selectedColumns={selectedColumns}
                handleClickSchema={(schemaId: string, schema: ISchema) => {
                    handleChooseSchema(schemaId, "", geometry)
                }}
                onTableSearchChange={(newValue: string) => {
                    this.setState({ dataTableSearchKeywords: newValue })
                    this.onTableSearchChangeDebounced(newValue, this.state.selectedSchemaId)
                }}
                handleClickTable={(table: ITable) => {
                    handleChooseTable(table)
                    this.setState({ selectedTable: table })
                }}
                onChooseColumn={(column: IColumn) => {
                    handleChooseColumn(column, layer["schema"], this.state.selectedTable, mapId, layerId, layer)
                }}
                backToSchemaView={() => showSchemaView()}
                backToTableView={() => showTableView()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { ealgis, databrowser, maps } = state
    const layer: ILayer = maps[ownProps.params.mapId].json.layers[ownProps.params.layerId]

    return {
        mapId: ownProps.params.mapId,
        layerId: ownProps.params.layerId,
        mapNameURLSafe: maps[ownProps.params.mapId]["name-url-safe"],
        layer: layer,
        geometry: ealgis.geominfo[`${layer.schema}.${layer.geometry}`],
        selectedTables: databrowser.selectedTables,
        selectedColumns: databrowser.selectedColumns,
        selectedColumn: databrowser.selectedColumn,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        handleChooseSchema: (schemaId: string, searchString: string, geometry: IGeomTable) => {
            dispatch(searchTables(searchString.split(" "), [], schemaId, geometry))
        },
        handleChooseTable: (table: ITable) => {
            dispatch(fetchColumns(table.schema_name, table.name))
        },
        showSchemaView: () => {
            dispatch(emptySelectedTables())
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
            const columnPartial: ISelectedColumn = { id: column.id, schema: schema_name }

            dispatch(loadColumn(column, schema_name))
            dispatch(loadTable(selectedTable, schema_name))
            dispatch(addColumnToLayerSelection(mapId, layerId, columnPartial))
            dispatch(change("layerForm", "selectedColumns", [...layer.selectedColumns, columnPartial]))
        },
        handleExitDataBrowser: () => {
            dispatch(emptySelectedTables())
            dispatch(emptySelectedColumns())
        },
    }
}

const DataBrowserContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataBrowserContainer)

export default withRouter(DataBrowserContainerWrapped)
