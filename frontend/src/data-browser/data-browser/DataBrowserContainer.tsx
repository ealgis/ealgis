import * as React from "react"
import { connect } from "react-redux"
import DataBrowser from "./DataBrowser"
import { withRouter } from "react-router"
import { change } from "redux-form"
import {
    selectColumn,
    fetchTablesForSchema,
    searchTables,
    fetchColumns,
    emptySelectedTables,
    emptySelectedColumns,
    finishBrowsing,
} from "../../redux/modules/databrowser"
import { setActiveContentComponent } from "../../redux/modules/app"
import { addColumnToLayerSelection } from "../../redux/modules/maps"
import { loadTable, loadColumn, addToRecentTables, toggleFavouriteTables } from "../../redux/modules/ealgis"
import {
    IStore,
    ISchemaInfo,
    ISchema,
    ITable,
    ITableInfo,
    ISelectedColumn,
    IGeomTable,
    IColumn,
    ILayer,
    IDataBrowserConfig,
    ISelectedSchemas,
    eEalUIComponent,
} from "../../redux/modules/interfaces"

import { EALGISApiClient } from "../../shared/api/EALGISApiClient"

interface IProps {
    params: IRouteProps
}

export interface IStoreProps {
    mapId: number
    layerId: number
    mapNameURLSafe: string
    geometry: IGeomTable
    selectedTables: Array<Partial<ITable>>
    selectedColumns: Array<string>
    recentTables: Array<Partial<ITable>>
    favouriteTables: Array<Partial<ITable>>
    config: IDataBrowserConfig
    tableinfo: ITableInfo
    schemainfo: ISchemaInfo
}

export interface IDispatchProps {
    getSchemaTables: Function
    handleTableSearch: Function
    handleChooseTable: Function
    favouriteTable: Function
    showSchemaView: Function
    showTableView: Function
    handleChooseColumn: Function
    handleFinishBrowsing: Function
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
    selectedSchemasForSearch?: ISelectedSchemas
    selectedSchemaId?: string
    dataTableSearchKeywords?: string
    selectedTable?: ITable
}

export class DataBrowserContainer extends React.Component<IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps, IState> {
    self: DataBrowserContainer = this

    constructor(props: IStoreProps & IDispatchProps & IRouterProps) {
        super(props)
        this.state = {}
    }

    async handleSelectSchema(schema: ISchema) {
        this.setState({ selectedSchemaId: schema.schema_name, selectedSchemasForSearch: undefined })
    }

    async handleUnselectSchema() {
        this.setState({ selectedSchemaId: undefined })
    }

    // componentWillReceiveProps(nextProps: IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps) {
    //     // If only one table is returned, automatically open it
    //     if (nextProps.selectedColumns.length === 0 && nextProps.selectedTables.length === 1) {
    //         console.log("componentWillReceiveProps")
    //         const tableUID = `${nextProps.selectedTables[0].schema_name}-${nextProps.selectedTables[0].id}`
    //         const table = nextProps.tableinfo[tableUID]

    //         nextProps.handleChooseTable(table)
    //         this.setState({ selectedTable: table })
    //     }
    // }

    render() {
        const {
            mapId,
            layerId,
            mapNameURLSafe,
            geometry,
            getSchemaTables,
            handleTableSearch,
            recentTables,
            favouriteTables,
            config,
            selectedTables,
            handleChooseTable,
            favouriteTable,
            selectedColumns,
            schemainfo,
            showTableView,
            showSchemaView,
            handleChooseColumn,
            handleFinishBrowsing,
        } = this.props

        return (
            <DataBrowser
                config={config}
                mapId={mapId}
                layerId={layerId}
                mapNameURLSafe={mapNameURLSafe}
                dataTableSearchKeywords={this.state.dataTableSearchKeywords}
                recentTables={recentTables}
                favouriteTables={favouriteTables}
                selectedTables={selectedTables}
                selectedTable={this.state.selectedTable}
                selectedColumns={selectedColumns}
                schemainfo={schemainfo}
                handleClickSchema={(schema: ISchema) => {
                    this.handleSelectSchema(schema)
                    getSchemaTables(schema.schema_name, geometry)
                }}
                onChangeSchemaSelection={(selectedSchemas: ISelectedSchemas) => {
                    this.setState({ selectedSchemasForSearch: selectedSchemas })
                    handleTableSearch(this.state.selectedSchemaId, this.state.dataTableSearchKeywords, geometry, selectedSchemas)
                }}
                onTableSearchChange={(newValue: string) => {
                    this.setState({ dataTableSearchKeywords: newValue })
                    handleTableSearch(this.state.selectedSchemaId, newValue, geometry, this.state.selectedSchemasForSearch)
                }}
                handleClickTable={(table: ITable) => {
                    handleChooseTable(table)
                    this.setState({ selectedTable: table })
                }}
                handleFavouriteTable={(table: ITable) => {
                    favouriteTable(table)
                }}
                onChooseColumn={(column: IColumn) => {
                    if (config.closeOnFinish) {
                        handleFinishBrowsing()
                    }
                    handleChooseColumn(column /*, layer["schema"], this.state.selectedTable, mapId, layerId, layer*/)
                }}
                onFinishBrowsing={() => {
                    handleFinishBrowsing()
                }}
                backToSchemaView={() => {
                    this.handleUnselectSchema()
                    showSchemaView()
                }}
                backToTableList={() => {
                    this.setState({ dataTableSearchKeywords: undefined })

                    const schema = schemainfo[this.state.selectedSchemaId!]
                    this.handleSelectSchema(schema)
                    getSchemaTables(schema.schema_name, geometry)
                }}
                backToTableView={() => {
                    showTableView()
                }}
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
        geometry: ealgis.geominfo[`${layer.schema}.${layer.geometry}`],
        recentTables: ealgis.user.recent_tables,
        favouriteTables: ealgis.user.favourite_tables,
        config: databrowser.config,
        selectedTables: databrowser.tables,
        selectedColumns: databrowser.columns,
        tableinfo: ealgis.tableinfo,
        schemainfo: ealgis.schemainfo,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        getSchemaTables: (schemaId: string, geometry: IGeomTable) => {
            dispatch(fetchTablesForSchema(schemaId, geometry))
        },
        handleTableSearch: (schemaId: string, searchString: string, geometry: IGeomTable, selectedSchemas?: ISelectedSchemas) => {
            let searchTerms: Array<string> = []
            if (searchString !== undefined) {
                searchTerms = searchString.split(" ")
            }

            let searchTermsExcluded: Array<string> = [] // Not implemented in the UI (yet?)

            if (selectedSchemas === undefined) {
                selectedSchemas = {
                    families: [],
                    schemas: [schemaId],
                }
            }

            if (searchTerms.length > 0) {
                dispatch(searchTables(searchTerms, searchTermsExcluded, geometry, selectedSchemas))
            }
        },
        handleChooseTable: (table: ITable) => {
            dispatch(fetchColumns(table.schema_name, table.id))
        },
        favouriteTable: (table: ITable) => {
            dispatch(toggleFavouriteTables([table]))
        },
        showSchemaView: () => {
            dispatch(emptySelectedTables())
        },
        showTableView: () => {
            dispatch(emptySelectedColumns())
        },
        handleChooseColumn: (
            column: IColumn
            // schema_name: string,
            // selectedTable: ITable,
            // mapId: number,
            // layerId: number,
            // layer: ILayer
        ) => {
            // const columnPartial: ISelectedColumn = { id: column.id, schema: schema_name }

            // dispatch(loadColumn(column, schema_name))
            // dispatch(loadTable(selectedTable, schema_name))
            dispatch(selectColumn(column))

            const tables: Array<Partial<ITable>> = [{ id: column.table_info_id, schema_name: column.schema_name }]
            dispatch(addToRecentTables(tables))
            // dispatch(addColumnToLayerSelection(mapId, layerId, columnPartial))
            // dispatch(change("layerForm", "selectedColumns", [...layer.selectedColumns, columnPartial]))
        },
        handleFinishBrowsing: () => {
            dispatch(setActiveContentComponent(eEalUIComponent.MAP_UI))
            dispatch(finishBrowsing())
        },
        handleExitDataBrowser: () => {
            dispatch(emptySelectedTables())
            dispatch(emptySelectedColumns())
        },
    }
}

const DataBrowserContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataBrowserContainer)

export default withRouter(DataBrowserContainerWrapped)
