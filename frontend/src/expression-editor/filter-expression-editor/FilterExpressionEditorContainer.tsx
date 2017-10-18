import * as React from "react"
import { connect } from "react-redux"
import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { withRouter } from "react-router"
import { isEqual, debounce, reduce } from "lodash-es"
import { values as objectValues } from "core-js/library/fn/object"
import FilterExpressionEditor from "./FilterExpressionEditor"
import { toggleModalState } from "../../redux/modules/app"
import { setActiveContentComponent } from "../../redux/modules/app"
import { startBrowsing, fetchResultForComponent } from "../../redux/modules/databrowser"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
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
    layerDefinition: ILayer
    columninfo: IColumnInfo
    filterExpression: string
    dataBrowserResult: IDataBrowserResult
}

export interface IDispatchProps {
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
}

export class FilterExpressionEditorContainer extends React.Component<
    IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps,
    IState
> {
    onFieldChangeDebounced: Function

    constructor(props: IDispatchProps & IRouterProps) {
        super(props)
        this.state = { expression: {} }

        // @TODO Do we need this?
        // props.router.setRouteLeaveHook(props.route, this.routerWillLeave.bind(this))
    }

    componentWillMount() {
        const { mapDefinition, layerId, layerDefinition, filterExpression } = this.props

        const parsed: any = this.parseExpression(filterExpression)
        if (parsed !== undefined) {
            this.setState({ expression: parsed })
        }
    }

    componentDidUpdate(prevProps: IProps & IStoreProps, prevState: IState) {
        console.log("componentDidUpdate", this.props.dataBrowserResult, prevProps.dataBrowserResult)

        const { dataBrowserResult } = this.props
        const { expression } = this.state

        if (dataBrowserResult.valid && dataBrowserResult !== prevProps.dataBrowserResult) {
            if (dataBrowserResult.message === "filter_col_1") {
                expression["col1"] = dataBrowserResult.columns![0]
            }
            this.setState({ expression: expression })
        }
    }

    routerWillLeave(nextLocation: any) {
        return true

        // @TODO Do we need this?
        // const { mapDefinition, layerId /*, isDirty, onToggleDirtyFormModalState*/ } = this.props

        // Prompt the user to discard/save their changes if we're navigate away from the layer form
        /*if (!nextLocation.pathname.startsWith(`/map/${mapDefinition.id}/${mapDefinition["name-url-safe"]}/layer/${layerId}`)) {
            // return false to prevent a transition w/o prompting the user,
            // or return a string to allow the user to decide:
            if (isDirty) {
                onToggleDirtyFormModalState()
                // return 'Your layer is not saved! Are you sure you want to leave?'
                return false
            }
        }*/
    }

    compileExpression() {
        const { expression } = this.state
        let expr: string = ""

        if ("col1" in expression && "operator" in expression && "col2" in expression) {
            expr = `${expression["col1"].name}${expression["operator"].name}${expression["col2"].name}`
        }
        return expr
    }

    getColumnByName(column_name: string) {
        const { columninfo } = this.props

        for (let key in columninfo) {
            const col: IColumn = columninfo[key]
            if (col.name === column_name) {
                return col
            }
        }
        return null
    }

    parseExpression(expression: string) {
        const { columninfo } = this.props

        // FIXME Hacky for proof of concept component
        if (expression != "") {
            let matches = expression.match(/([a-z0-9]+)([>=<!]{1,2})([a-z0-9]+)/)
            if (matches !== null) {
                return {
                    col1: this.getColumnByName(matches[1]),
                    operator: matches[2],
                    col2: this.getColumnByName(matches[3]) || matches[3],
                }
            }
        }
    }

    render() {
        const { muiThemePalette, mapDefinition, layerId, layerDefinition, columninfo, onApply, activateDataBrowser } = this.props
        const { expression } = this.state

        return (
            <FilterExpressionEditor
                muiThemePalette={muiThemePalette}
                mapId={mapDefinition.id}
                mapNameURLSafe={mapDefinition["name-url-safe"]}
                layerDefinition={layerDefinition}
                layerId={layerId}
                layerHash={layerDefinition.hash || ""}
                columninfo={columninfo}
                expression={expression}
                onFieldChange={(payload: { field: string; value: any }) => {
                    expression[payload.field] = payload.value
                    this.setState({ expression: expression })
                }}
                onApply={() => {
                    onApply(this.compileExpression())
                }}
                onOpenDataBrowser={(message: string) => {
                    activateDataBrowser(message)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { maps, ealgis, databrowser } = state
    const layerFormValues = formValueSelector("layerForm")

    return {
        muiThemePalette: ownProps.muiTheme.palette,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        layerDefinition: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        columninfo: ealgis.columninfo,
        filterExpression: layerFormValues(state, "filterExpression") as string,
        dataBrowserResult: fetchResultForComponent(eEalUIComponent.FILTER_EXPRESSION_EDITOR, state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        activateDataBrowser: (message: string) => {
            dispatch(setActiveContentComponent(eEalUIComponent.DATA_BROWSER))
            dispatch(startBrowsing(eEalUIComponent.FILTER_EXPRESSION_EDITOR, message))
        },
    }
}

const FilterExpressionEditorContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(FilterExpressionEditorContainer)

export default muiThemeable()(withRouter(FilterExpressionEditorContainerWrapped))
