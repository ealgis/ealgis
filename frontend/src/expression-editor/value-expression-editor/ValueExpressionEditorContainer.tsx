import * as React from "react"
import { connect } from "react-redux"
import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { withRouter } from "react-router"
import { isEqual, debounce, reduce } from "lodash-es"
import { values as objectValues } from "core-js/library/fn/object"
import ValueExpressionEditor from "./ValueExpressionEditor"
import { toggleModalState } from "../../redux/modules/app"
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
    valueExpression: string
}

export interface IDispatchProps {}

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

export class ValueExpressionEditorContainer extends React.Component<
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
        const { mapDefinition, layerId, layerDefinition, valueExpression } = this.props

        const parsed: any = this.parseExpression(valueExpression)
        if (parsed !== undefined) {
            this.setState({ expression: parsed })
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

        if ("col1" in expression) {
            expr = expression["col1"].name

            if ("map_multiple" in expression && expression["map_multiple"] === true) {
                if ("col2" in expression) {
                    expr = `${expression["col1"].name}/${expression["col2"].name}`
                }

                if ("as_percentage" in expression) {
                    expr = `(${expr})*100`
                }
            }
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
        if (expression.includes("/")) {
            let matches = expression.match(/[a-z0-9]+\/[a-z0-9]+/)
            if (matches !== null) {
                let column_names = matches[0].split("/")
                if (expression.includes("*100")) {
                    return {
                        col1: this.getColumnByName(column_names[0]),
                        map_multiple: true,
                        col2: this.getColumnByName(column_names[1]),
                        as_percentage: true,
                    }
                }

                return {
                    col1: this.getColumnByName(column_names[0]),
                    map_multiple: true,
                    col2: this.getColumnByName(column_names[1]),
                }
            }
        }

        return {
            col1: this.getColumnByName(expression),
        }
    }

    render() {
        const { muiThemePalette, mapDefinition, layerId, layerDefinition, columninfo, valueExpression, onApply } = this.props
        const { expression } = this.state

        return (
            <ValueExpressionEditor
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
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { maps, ealgis } = state
    const layerFormValues = formValueSelector("layerForm")

    return {
        muiThemePalette: ownProps.muiTheme.palette,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        layerDefinition: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        columninfo: ealgis.columninfo,
        valueExpression: layerFormValues(state, "valueExpression") as string,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const ValueExpressionEditorContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(ValueExpressionEditorContainer)

export default muiThemeable()(withRouter(ValueExpressionEditorContainerWrapped))
