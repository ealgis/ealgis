import muiThemeable from "material-ui/styles/muiThemeable"
import * as React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { change, formValueSelector } from "redux-form"
import { setActiveContentComponent, toggleModalState } from "../../redux/modules/app"
import { fetchResultForComponent, finishBrowsing, getValueExpressionWithColumns, startBrowsing } from "../../redux/modules/databrowser"
import {
    IColumnInfo,
    IDataBrowserConfig,
    IDataBrowserResult,
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
    columninfo: IColumnInfo
    valueExpression: string
    valueExpressionMode: eLayerValueExpressionMode
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
    expressionMode: eLayerValueExpressionMode
}

export class ValueExpressionEditorContainer extends React.PureComponent<
    IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps,
    IState
> {
    onFieldChangeDebounced: Function

    constructor(props: IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps) {
        super(props)
        this.state = { expression: {}, expressionMode: props.valueExpressionMode }
    }

    componentWillMount() {
        const { mapDefinition, layerId, valueExpression, columninfo } = this.props
        const { expressionMode } = this.state

        const parsed: any = getValueExpressionWithColumns(valueExpression, expressionMode, columninfo)
        if (parsed !== undefined) {
            this.setState({ ...this.state, expression: parsed })
        }
    }

    componentDidUpdate(prevProps: IProps & IStoreProps, prevState: IState) {
        const { dataBrowserResult, onApply, handleChangeExpressionMode } = this.props
        const { expression, expressionMode } = this.state

        if (dataBrowserResult.valid && JSON.stringify(dataBrowserResult) !== JSON.stringify(prevProps.dataBrowserResult)) {
            if (dataBrowserResult.message === "col1") {
                expression["col1"] = dataBrowserResult.columns![0]
                this.setState({ ...this.state, expression: expression }, this.applyExpression)
            } else if (dataBrowserResult.message === "col2") {
                expression["col2"] = dataBrowserResult.columns![0]
                this.setState({ ...this.state, expression: expression }, this.applyExpression)
            }
        }
    }

    applyExpression() {
        const { onApply, handleChangeExpressionMode } = this.props
        const { expressionMode } = this.state

        if (this.isExpressionComplete()) {
            onApply(this.compileExpression())
            handleChangeExpressionMode(expressionMode)
        }
    }

    isExpressionComplete() {
        const { expression, expressionMode } = this.state

        if (expressionMode === eLayerValueExpressionMode.SINGLE && "col1" in expression) {
            return true
        }

        if (expressionMode === eLayerValueExpressionMode.PROPORTIONAL && "col1" in expression && "col2" in expression) {
            return true
        }

        return false
    }

    compileExpression() {
        const { expression, expressionMode } = this.state
        let expr: string = ""

        if ("col1" in expression) {
            expr = `${expression["col1"].schema_name}.${expression["col1"].name}`

            if ("col2" in expression && expressionMode === eLayerValueExpressionMode.PROPORTIONAL) {
                if ("col2" in expression) {
                    expr = `(${expression["col1"].schema_name}.${expression["col1"].name}/${expression["col2"].schema_name}.${
                        expression["col2"].name
                    })*100`
                }
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
            onApply,
            handleChangeExpressionMode,
            onToggleAdvancedModeWarnModalState,
            activateDataBrowser,
            deactivateDataBrowser,
        } = this.props
        const { expression } = this.state

        return (
            <ValueExpressionEditor
                muiThemePalette={muiThemePalette}
                mapId={mapDefinition.id}
                mapNameURLSafe={mapDefinition["name-url-safe"]}
                layerId={layerId}
                expression={expression}
                expressionCompiled={valueExpression}
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
                    deactivateDataBrowser()
                    handleChangeExpressionMode(this.state.expressionMode)
                }}
                onApplyAdvanced={() => {
                    onApply(this.state.expressionCompiled)
                    deactivateDataBrowser()
                    handleChangeExpressionMode(this.state.expressionMode)
                }}
                onChangeExpressionMode={(mode: eLayerValueExpressionMode) => {
                    this.setState({ ...this.state, expressionMode: mode })
                    if (mode === eLayerValueExpressionMode.ADVANCED) {
                        activateDataBrowser("advanced", eEalUIComponent.VALUE_EXPRESSION_EDITOR)
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
    const { app, maps, ealgis } = state
    const layerFormValues = formValueSelector("layerForm")

    return {
        muiThemePalette: ownProps.muiTheme.palette,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        columninfo: ealgis.columninfo,
        valueExpression: layerFormValues(state, "valueExpression") as string,
        valueExpressionMode: layerFormValues(state, "valueExpressionMode") as eLayerValueExpressionMode,
        advancedModeModalOpen: app.modals.get("valueExpressionAdvancedModeWarning") || false,
        dataBrowserResult: fetchResultForComponent(eEalUIComponent.VALUE_EXPRESSION_EDITOR, state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        handleChangeExpressionMode(mode: eLayerValueExpressionMode) {
            dispatch(change("layerForm", "valueExpressionMode", mode))
        },
        onToggleAdvancedModeWarnModalState: () => {
            dispatch(toggleModalState("valueExpressionAdvancedModeWarning"))
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

const ValueExpressionEditorContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(ValueExpressionEditorContainer)

export default muiThemeable()(withRouter(ValueExpressionEditorContainerWrapped))
