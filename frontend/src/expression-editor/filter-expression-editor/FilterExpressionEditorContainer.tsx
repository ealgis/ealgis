import * as React from "react"
import { connect } from "react-redux"
import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { withRouter } from "react-router"
import { isEqual, debounce, reduce } from "lodash-es"
import { values as objectValues } from "core-js/library/fn/object"
import FilterExpressionEditor from "./FilterExpressionEditor"
import { setActiveContentComponent, toggleModalState } from "../../redux/modules/app"
import {
    startBrowsing,
    finishBrowsing,
    fetchResultForComponent,
    parseFilterExpression,
    getFilterExpressionWithColumns,
} from "../../redux/modules/databrowser"
import {
    IStore,
    IEALGISModule,
    ILayerQuerySummary,
    IGeomInfo,
    IGeomTable,
    IColourInfo,
    IColumnInfo,
    IMap,
    ILayer,
    IColumn,
    ISelectedColumn,
    IMUITheme,
    IMUIThemePalette,
    eEalUIComponent,
    eLayerFilterExpressionMode,
    IDataBrowserConfig,
    IDataBrowserResult,
} from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

export interface IProps {
    onApply: Function
}

export interface IStoreProps {
    muiThemePalette: IMUIThemePalette
    mapDefinition: IMap
    layerId: number
    columninfo: IColumnInfo
    filterExpression: string
    filterExpressionMode: eLayerFilterExpressionMode
    valueExpression: string
    advancedModeModalOpen: boolean
    dataBrowserResult: IDataBrowserResult
}

export interface IDispatchProps {
    handleChangeExpressionMode: Function
    onToggleAdvancedModeWarnModalState: Function
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
        const { mapDefinition, layerId, filterExpression, filterExpressionMode, columninfo } = this.props
        const { expressionMode } = this.state

        const parsed1: any = parseFilterExpression(filterExpression, expressionMode)
        const parsed2: any = getFilterExpressionWithColumns(parsed1, expressionMode, columninfo)
        if (parsed2 !== undefined) {
            this.setState({ ...this.state, expression: parsed2 })
        }
    }

    componentDidUpdate(prevProps: IProps & IStoreProps, prevState: IState) {
        const { dataBrowserResult } = this.props
        const { expression } = this.state

        if (dataBrowserResult.valid && dataBrowserResult !== prevProps.dataBrowserResult) {
            if (dataBrowserResult.message === "col1") {
                expression["col1"] = dataBrowserResult.columns![0]
            } else if (dataBrowserResult.message === "col2") {
                expression["col2"] = dataBrowserResult.columns![0]
            }
            this.setState({ ...this.state, expression: expression })
        }
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
                col1 = expression["col1"].name
            }

            let col2 = undefined
            if (isNaN(expression["col2"]) === false) {
                col2 = expression["col2"]
            } else {
                col2 = expression["col2"].name
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
            handleChangeExpressionMode,
            onToggleAdvancedModeWarnModalState,
            activateDataBrowser,
            deactivateDataBrowser,
        } = this.props
        const { expression } = this.state

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
                    this.setState({ ...this.state, expression: expr })
                }}
                onExpressionChange={(expressionCompiled: string) => {
                    this.setState({ ...this.state, expressionCompiled: expressionCompiled })
                }}
                onApply={() => {
                    onApply(this.compileExpression())
                    handleChangeExpressionMode(this.state.expressionMode)
                }}
                onApplyAdvanced={() => {
                    onApply(this.state.expressionCompiled)
                    handleChangeExpressionMode(this.state.expressionMode)
                }}
                onChangeExpressionMode={(mode: eLayerFilterExpressionMode) => {
                    this.setState({ ...this.state, expressionMode: mode })
                    if (mode === eLayerFilterExpressionMode.ADVANCED) {
                        activateDataBrowser("advanced", eEalUIComponent.FILTER_EXPRESSION_EDITOR)
                    }
                }}
                onToggleAdvModeModalState={() => onToggleAdvancedModeWarnModalState()}
                onClose={() => deactivateDataBrowser()}
                openDataBrowser={() => activateDataBrowser()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app, maps, ealgis, databrowser } = state
    const layerFormValues = formValueSelector("layerForm")

    return {
        muiThemePalette: ownProps.muiTheme.palette,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
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
        handleChangeExpressionMode(mode: eLayerFilterExpressionMode) {
            dispatch(change("layerForm", "filterExpressionMode", mode))
        },
        onToggleAdvancedModeWarnModalState: () => {
            dispatch(toggleModalState("filterExpressionAdvancedModeWarning"))
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

const FilterExpressionEditorContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(FilterExpressionEditorContainer)

export default muiThemeable()(withRouter(FilterExpressionEditorContainerWrapped))
