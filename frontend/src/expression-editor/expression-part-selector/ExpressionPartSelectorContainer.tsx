import * as React from "react"
import { connect } from "react-redux"
import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { withRouter } from "react-router"
import { isEqual, debounce, reduce } from "lodash-es"
import { values as objectValues } from "core-js/library/fn/object"
import ExpressionPartSelector from "./ExpressionPartSelector"
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
    // onApply: Function
}

export interface IStoreProps {
    // muiThemePalette: IMUIThemePalette
    // mapDefinition: IMap
    // layerId: number
    // layerDefinition: ILayer
    // columninfo: IColumnInfo
    // filterExpression: string
    // dataBrowserResult: IDataBrowserResult
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

export class ExpressionPartSelectorContainer extends React.Component<
    IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps,
    IState
> {
    constructor(props: IDispatchProps & IRouterProps) {
        super(props)
        this.state = { expression: {} }
    }

    render() {
        const { /*muiThemePalette, mapDefinition, layerId, layerDefinition, columninfo, onApply,*/ activateDataBrowser } = this.props
        const { expression } = this.state

        return (
            <ExpressionPartSelector
                onFieldChange={(payload: { field: string; value: any }) => {
                    console.log("onFieldChange payload", payload)
                    // expression[payload.field] = payload.value
                    // this.setState({ expression: expression })
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
    // const layerFormValues = formValueSelector("layerForm")

    return {
        // muiThemePalette: ownProps.muiTheme.palette,
        // mapDefinition: maps[ownProps.params.mapId],
        // layerId: ownProps.params.layerId,
        // layerDefinition: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        // columninfo: ealgis.columninfo,
        // filterExpression: layerFormValues(state, "filterExpression") as string,
        // dataBrowserResult: fetchResultForComponent(eEalUIComponent.FILTER_EXPRESSION_EDITOR, state),
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

const ExpressionPartSelectorContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(ExpressionPartSelectorContainer)

export default muiThemeable()(withRouter(ExpressionPartSelectorContainerWrapped))
