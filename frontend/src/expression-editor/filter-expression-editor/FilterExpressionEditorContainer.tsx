import muiThemeable from "material-ui/styles/muiThemeable"
import * as React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { formValueSelector } from "redux-form"
import { setActiveContentComponent, toggleModalState, eEalUIComponent } from "../../redux/modules/app"
import { fetchResultForComponent, getFilterExpressionWithColumns, startBrowsing, IDataBrowserResult, IDataBrowserConfig } from "../../redux/modules/databrowser"
import {
    IMUITheme,
    IMUIThemePalette,
} from "../../redux/modules/interfaces"
import FilterExpressionEditor from "./FilterExpressionEditor"
import { IMap, eLayerFilterExpressionMode, ILayer } from "../../redux/modules/maps";
import { IGeomTable, IColumnInfo } from "../../redux/modules/ealgis";
import { IStore } from "../../redux/modules/reducer";

export interface IProps {
    onApply: Function
}

export interface IStoreProps {
    muiThemePalette: IMUIThemePalette
    mapDefinition: IMap
    layerId: number
    geometry: IGeomTable
    columninfo: IColumnInfo
    filterExpression: string
    filterExpressionMode: eLayerFilterExpressionMode
    valueExpression: string
    advancedModeModalOpen: boolean
    dataBrowserResult: IDataBrowserResult
}

export interface IDispatchProps {
    onToggleAdvancedModeWarnModalState: Function
    activateDataBrowser: Function
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
    expressionMode: eLayerFilterExpressionMode
}

export class FilterExpressionEditorContainer extends React.PureComponent<
    IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps,
    IState
> {
    constructor(props: IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps) {
        super(props)
        this.state = { expression: {}, expressionMode: props.filterExpressionMode }
    }

    componentWillMount() {
        const { mapDefinition, layerId, geometry, filterExpression, filterExpressionMode, columninfo } = this.props
        const { expressionMode } = this.state

        const parsed: any = getFilterExpressionWithColumns(filterExpression, expressionMode, columninfo, geometry)
        if (parsed !== undefined) {
            this.setState({ ...this.state, expression: parsed })
        }
    }

    componentDidUpdate(prevProps: IProps & IStoreProps, prevState: IState) {
        const { dataBrowserResult } = this.props
        const { expression } = this.state

        if (dataBrowserResult.valid && JSON.stringify(dataBrowserResult) !== JSON.stringify(prevProps.dataBrowserResult)) {
            if (dataBrowserResult.message === "col1") {
                expression["col1"] = dataBrowserResult.columns![0]
            } else if (dataBrowserResult.message === "col2") {
                expression["col2"] = dataBrowserResult.columns![0]
            }
            this.setState({ ...this.state, expression: expression }, this.applyExpression)
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

        if (
            expressionMode === eLayerFilterExpressionMode.SIMPLE &&
            "col1" in expression &&
            "operator" in expression &&
            "col2" in expression
        ) {
            return true
        }

        return false
    }

    compileExpression() {
        const { valueExpression } = this.props
        const { expression } = this.state
        let expr: string = ""

        if ("col1" in expression && "operator" in expression && "col2" in expression) {
            let col1 = undefined
            if (expression["col1"] === "$value") {
                col1 = "$value" // Replaced server-side
            } else {
                col1 = `${expression["col1"].schema_name}.${expression["col1"].name}`
            }

            let col2 = undefined
            if (isNaN(expression["col2"]) === false) {
                // It's a number
                col2 = expression["col2"]
            } else {
                col2 = `${expression["col2"].schema_name}.${expression["col2"].name}`
            }

            expr = `${col1}${expression["operator"]}${col2}`
        }
        return expr
    }

    render() {
        const {
            muiThemePalette,
            mapDefinition,
            layerId,
            filterExpression,
            advancedModeModalOpen,
            onApply,
            onToggleAdvancedModeWarnModalState,
            activateDataBrowser,
        } = this.props
        const { expression, expressionMode } = this.state

        return (
            <FilterExpressionEditor
                muiThemePalette={muiThemePalette}
                mapId={mapDefinition.id}
                mapNameURLSafe={mapDefinition["name-url-safe"]}
                layerId={layerId}
                expression={expression}
                expressionCompiled={filterExpression}
                expressionMode={this.state.expressionMode}
                advancedModeModalOpen={advancedModeModalOpen}
                onFieldChange={(payload: { field: string; value: any }) => {
                    let expr: any = { ...expression }
                    expr[payload.field] = payload.value
                    this.setState({ ...this.state, expression: expr }, this.applyExpression)
                }}
                onExpressionChange={(expressionCompiled: string) => {
                    this.setState({ ...this.state, expressionCompiled: expressionCompiled })
                }}
                onApply={() => {
                    onApply(this.compileExpression(), expressionMode)
                }}
                onApplyAdvanced={() => {
                    onApply(this.state.expressionCompiled, expressionMode)
                }}
                onChangeExpressionMode={(mode: eLayerFilterExpressionMode) => {
                    this.setState({ ...this.state, expressionMode: mode })
                    if (mode === eLayerFilterExpressionMode.ADVANCED) {
                        activateDataBrowser("advanced", eEalUIComponent.FILTER_EXPRESSION_EDITOR)
                    }
                }}
                onToggleAdvModeModalState={() => onToggleAdvancedModeWarnModalState()}
                openDataBrowser={() => activateDataBrowser()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app, maps, ealgis, databrowser } = state
    const layerFormValues = formValueSelector("layerForm")
    const layer: ILayer = maps[ownProps.params.mapId].json.layers[ownProps.params.layerId]

    return {
        muiThemePalette: ownProps.muiTheme.palette,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        geometry: ealgis.geominfo[`${layer.schema}.${layer.geometry}`],
        columninfo: ealgis.columninfo,
        filterExpression: layerFormValues(state, "filterExpression") as string,
        filterExpressionMode: layerFormValues(state, "filterExpressionMode") as eLayerFilterExpressionMode,
        valueExpression: layerFormValues(state, "valueExpression") as string,
        advancedModeModalOpen: app.modals.get("filterExpressionAdvancedModeWarning") || false,
        dataBrowserResult: fetchResultForComponent(eEalUIComponent.FILTER_EXPRESSION_EDITOR, state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onToggleAdvancedModeWarnModalState: () => {
            dispatch(toggleModalState("filterExpressionAdvancedModeWarning"))
        },
        activateDataBrowser: (message: string, componentId: eEalUIComponent) => {
            dispatch(setActiveContentComponent(eEalUIComponent.DATA_BROWSER))
            const config: IDataBrowserConfig = { showColumnNames: true, closeOnFinish: false }
            dispatch(startBrowsing(componentId, message, config))
        },
    }
}

// Caused by muiThemable() https://github.com/mui-org/material-ui/issues/5975 - resolved in MaterialUI 1.0
// @ts-ignore
const FilterExpressionEditorContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    FilterExpressionEditorContainer
)

export default muiThemeable()(withRouter(FilterExpressionEditorContainerWrapped))
