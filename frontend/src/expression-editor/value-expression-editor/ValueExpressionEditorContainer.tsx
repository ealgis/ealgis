import muiThemeable from "material-ui/styles/muiThemeable"
import * as React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { formValueSelector } from "redux-form"
import { setActiveContentComponent, toggleModalState } from "../../redux/modules/app"
import {
    deselectColumn,
    fetchLiveResultForComponent,
    finishBrowsing,
    getValueExpressionWithColumns,
    removeColumnFromList,
    startBrowsing,
} from "../../redux/modules/databrowser"
import {
    IColumn,
    IColumnInfo,
    IDataBrowserConfig,
    IDataBrowserResult,
    IGeomTable,
    ILayer,
    IMUITheme,
    IMUIThemePalette,
    IMap,
    IStore,
    eEalUIComponent,
    eLayerValueExpressionMode,
} from "../../redux/modules/interfaces"
import ValueExpressionEditor from "./ValueExpressionEditor"

export interface IProps {
    onApply: Function
}

export interface IStoreProps {
    muiThemePalette: IMUIThemePalette
    mapDefinition: IMap
    layerId: number
    geometry: IGeomTable
    columninfo: IColumnInfo
    valueExpression: string
    valueExpressionMode: eLayerValueExpressionMode
    advancedModeModalOpen: boolean
    dataBrowserResult: IDataBrowserResult
    isDataBrowserActive: boolean
}

export interface IDispatchProps {
    onToggleAdvancedModeWarnModalState: Function
    handleRemoveColumn: Function
    activateDataBrowser: Function
    deactivateDataBrowser: Function
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
    muiTheme: IMUITheme
}

interface IState {
    expression: { [key: string]: any }
    expressionCompiled?: string
    expressionMode: eLayerValueExpressionMode
}

export class ValueExpressionEditorContainer extends React.PureComponent<
    IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps,
    IState
> {
    constructor(props: IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps) {
        super(props)
        this.state = { expression: { colgroup1: [], colgroup2: [] }, expressionMode: props.valueExpressionMode }
    }

    componentWillMount() {
        const { mapDefinition, layerId, valueExpression, geometry, columninfo } = this.props
        const { expressionMode } = this.state

        const parsed: any = getValueExpressionWithColumns(valueExpression, expressionMode, columninfo, geometry)
        if (parsed !== undefined) {
            this.setState({ ...this.state, expression: parsed })
        }
    }

    componentDidUpdate(prevProps: IProps & IStoreProps, prevState: IState) {
        const { dataBrowserResult, onApply } = this.props
        const { expression } = this.state

        if (dataBrowserResult.valid && JSON.stringify(dataBrowserResult) !== JSON.stringify(prevProps.dataBrowserResult)) {
            if (dataBrowserResult.message === "colgroup1") {
                expression["colgroup1"] = dataBrowserResult.columns
                this.setState({ ...this.state, expression: expression }, this.applyExpression)
            } else if (dataBrowserResult.message === "colgroup2") {
                expression["colgroup2"] = dataBrowserResult.columns
                this.setState({ ...this.state, expression: expression }, this.applyExpression)
            }
        }
    }

    applyExpression() {
        const { onApply } = this.props
        const { expressionMode } = this.state

        if (this.isExpressionComplete()) {
            onApply(this.compileExpression(), expressionMode)
        }
    }

    isExpressionComplete() {
        const { expression, expressionMode } = this.state

        if (expressionMode === eLayerValueExpressionMode.SINGLE && "colgroup1" in expression) {
            return true
        }

        if (expressionMode === eLayerValueExpressionMode.PROPORTIONAL && "colgroup1" in expression && "colgroup2" in expression) {
            return true
        }

        return false
    }

    compileExpression() {
        const { expression, expressionMode } = this.state
        let expr: string = ""

        if ("colgroup1" in expression) {
            expr = expression["colgroup1"].map((column: IColumn) => `${column.schema_name}.${column.name}`).join("+")

            if ("colgroup2" in expression && expressionMode === eLayerValueExpressionMode.PROPORTIONAL) {
                // Only add brackets if there's more than two columns because brackets around
                // a single column slows down the database query (for some reason...)
                let colgroup1 = expression["colgroup1"].map((column: IColumn) => `${column.schema_name}.${column.name}`).join("+")
                if (expression["colgroup1"].length > 1) {
                    colgroup1 = `(${colgroup1})`
                }

                let colgroup2 = expression["colgroup2"].map((column: IColumn) => `${column.schema_name}.${column.name}`).join("+")
                if (expression["colgroup2"].length > 1) {
                    colgroup2 = `(${colgroup2})`
                }

                expr = `(${colgroup1}/${colgroup2})*100`
            }
        }
        return expr
    }

    render() {
        const {
            muiThemePalette,
            mapDefinition,
            layerId,
            valueExpression,
            advancedModeModalOpen,
            isDataBrowserActive,
            onApply,
            onToggleAdvancedModeWarnModalState,
            handleRemoveColumn,
            activateDataBrowser,
            deactivateDataBrowser,
        } = this.props
        const { expression, expressionMode } = this.state

        return (
            <ValueExpressionEditor
                muiThemePalette={muiThemePalette}
                mapId={mapDefinition.id}
                mapNameURLSafe={mapDefinition["name-url-safe"]}
                layerId={layerId}
                expression={expression}
                expressionCompiled={valueExpression}
                expressionMode={expressionMode}
                advancedModeModalOpen={advancedModeModalOpen}
                onRemoveColumn={(payload: { colgroup: string; column: IColumn }) => {
                    // If the Data Browser is active it's managing selected columns for us.
                    // If not, we just need to update the expression in our state.
                    if (isDataBrowserActive === true) {
                        handleRemoveColumn(payload.column)
                    } else {
                        let expr: any = { ...expression }
                        expr[payload.colgroup] = removeColumnFromList(expr[payload.colgroup], payload.column)
                        this.setState({ ...this.state, expression: expr }, this.applyExpression)
                    }
                }}
                onFieldChange={(payload: { field: string; value: any }) => {
                    let expr: any = { ...expression }
                    expr[payload.field] = payload.value
                    this.setState({ ...this.state, expression: expr })
                }}
                onExpressionChange={(expressionCompiled: string) => {
                    this.setState({ ...this.state, expressionCompiled: expressionCompiled })
                }}
                onApplyAdvanced={() => {
                    onApply(this.state.expressionCompiled, expressionMode)
                    deactivateDataBrowser()
                }}
                onChangeExpressionMode={(mode: eLayerValueExpressionMode) => {
                    this.setState({ ...this.state, expressionMode: mode })
                    if (mode === eLayerValueExpressionMode.ADVANCED) {
                        activateDataBrowser("advanced", eEalUIComponent.VALUE_EXPRESSION_EDITOR)
                    }
                }}
                onToggleAdvModeModalState={() => onToggleAdvancedModeWarnModalState()}
                openDataBrowser={() => activateDataBrowser()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app, maps, ealgis } = state
    const layerFormValues = formValueSelector("layerForm")
    const layer: ILayer = maps[ownProps.params.mapId].json.layers[ownProps.params.layerId]

    return {
        muiThemePalette: ownProps.muiTheme.palette,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        geometry: ealgis.geominfo[`${layer.schema}.${layer.geometry}`],
        columninfo: ealgis.columninfo,
        valueExpression: layerFormValues(state, "valueExpression") as string,
        valueExpressionMode: layerFormValues(state, "valueExpressionMode") as eLayerValueExpressionMode,
        advancedModeModalOpen: app.modals.get("valueExpressionAdvancedModeWarning") || false,
        dataBrowserResult: fetchLiveResultForComponent(eEalUIComponent.VALUE_EXPRESSION_EDITOR, state),
        isDataBrowserActive:
            app.activeContentComponent === eEalUIComponent.DATA_BROWSER ||
            app.activeContentComponent === eEalUIComponent.VALUE_EXPRESSION_EDITOR,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onToggleAdvancedModeWarnModalState: () => {
            dispatch(toggleModalState("valueExpressionAdvancedModeWarning"))
        },
        handleRemoveColumn: (column: IColumn) => {
            dispatch(deselectColumn(column))
        },
        activateDataBrowser: (message: string, componentId: eEalUIComponent) => {
            dispatch(setActiveContentComponent(eEalUIComponent.DATA_BROWSER))
            const config: IDataBrowserConfig = { showColumnNames: true, closeOnFinish: false }
            dispatch(startBrowsing(componentId, message, config))
        },
        deactivateDataBrowser: () => {
            dispatch(setActiveContentComponent(eEalUIComponent.MAP_UI))
            dispatch(finishBrowsing())
        },
    }
}

// Caused by muiThemable() https://github.com/mui-org/material-ui/issues/5975 - resolved in MaterialUI 1.0
// @ts-ignore
const ValueExpressionEditorContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    ValueExpressionEditorContainer
)

export default muiThemeable()(withRouter(ValueExpressionEditorContainerWrapped))
