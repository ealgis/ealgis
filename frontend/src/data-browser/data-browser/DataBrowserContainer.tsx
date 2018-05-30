import * as React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { setActiveContentComponent } from "../../redux/modules/app"
import {
    fetchColumns,
    fetchTableByFamilyAndGeometry,
    fetchTablesForSchema,
    finishBrowsing,
    getTablesForMap,
    removeAllColumns,
    removeAllTables,
    searchTables,
    selectColumn,
} from "../../redux/modules/databrowser"
import { addToRecentTables, toggleFavouriteTables } from "../../redux/modules/ealgis"
import {
    IColumn,
    IDataBrowserConfig,
    IGeomTable,
    ILayer,
    ISchema,
    ISchemaInfo,
    ISelectedSchemas,
    IStore,
    ITable,
    ITableInfo,
    eEalUIComponent,
} from "../../redux/modules/interfaces"
import DataBrowser from "./DataBrowser"

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
    activeColumns: Array<IColumn>
    recentTables: Array<Partial<ITable>>
    favouriteTables: Array<Partial<ITable>>
    mapTables: Array<ITable>
    config: IDataBrowserConfig
    tableinfo: ITableInfo
    schemainfo: ISchemaInfo
}

export interface IDispatchProps {
    getSchemaTables: Function
    handleTableSearch: Function
    handleChooseTable: Function
    getTableByFamilyAndGeometry: Function
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

    constructor(props: IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps) {
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
            mapTables,
            config,
            selectedTables,
            handleChooseTable,
            getTableByFamilyAndGeometry,
            favouriteTable,
            selectedColumns,
            activeColumns,
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
                mapTables={mapTables}
                selectedTables={selectedTables}
                selectedTable={this.state.selectedTable}
                selectedColumns={selectedColumns}
                activeColumns={activeColumns}
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
                onClickRecentFavouriteOrUsedInThisMapTable={async (table: ITable) => {
                    // Tables from Recents, Favourites, or Used In This Map may point to a
                    // geometry that is different to the geometry on this layer. In data schemas
                    // where tables exist at multiple levels of detail we'll be nice to the user
                    // and try to send them to the right table in this family for their current geometry.
                    const tableForLayerGeometry = await getTableByFamilyAndGeometry(table, geometry)
                    if (tableForLayerGeometry !== null) {
                        handleChooseTable(tableForLayerGeometry)
                        this.setState({ selectedTable: tableForLayerGeometry })
                    }
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
        mapTables: getTablesForMap(maps[ownProps.params.mapId], ealgis.tableinfo, ealgis.columninfo, ealgis.geominfo),
        config: databrowser.config,
        selectedTables: databrowser.tables,
        selectedColumns: databrowser.columns,
        activeColumns: databrowser.selectedColumns,
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

            let searchTermsExcluded: Array<string> = [] // Not implemented in the UI

            if (selectedSchemas === undefined && schemaId !== undefined) {
                selectedSchemas = {
                    families: [],
                    schemas: [schemaId],
                }
            }

            if (selectedSchemas !== undefined && selectedSchemas.families.length === 0 && selectedSchemas.families.length === 0) {
                dispatch(removeAllTables())
            } else if (searchTerms.length > 0) {
                dispatch(searchTables(searchTerms, searchTermsExcluded, geometry, selectedSchemas))
            }
        },
        handleChooseTable: (table: ITable) => {
            dispatch(fetchColumns(table.schema_name, table.id))
        },
        getTableByFamilyAndGeometry: async (table: ITable, geometry: IGeomTable) => {
            if (table.geometry_source_id !== geometry._id) {
                return await dispatch(fetchTableByFamilyAndGeometry(table, geometry))
            }
            return table
        },
        favouriteTable: (table: ITable) => {
            dispatch(toggleFavouriteTables([table]))
        },
        showSchemaView: () => {
            dispatch(removeAllTables())
        },
        showTableView: () => {
            dispatch(removeAllColumns())
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

            dispatch(addToRecentTables(column.schema_name, column.table_info_id))
            // dispatch(addColumnToLayerSelection(mapId, layerId, columnPartial))
            // dispatch(change("layerForm", "selectedColumns", [...layer.selectedColumns, columnPartial]))
        },
        handleFinishBrowsing: () => {
            dispatch(setActiveContentComponent(eEalUIComponent.MAP_UI))
            dispatch(finishBrowsing())
        },
        handleExitDataBrowser: () => {
            dispatch(removeAllTables())
            dispatch(removeAllColumns())
        },
    }
}

const DataBrowserContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    DataBrowserContainer
)

// @ts-ignore
export default withRouter(DataBrowserContainerWrapped)
