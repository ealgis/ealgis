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
    initDraftLayer,
    publishLayer,
    restoreMasterLayer,
    restoreMasterLayerAndDiscardForm,
    handleLayerFormChange,
    startLayerEditing,
    fitLayerScaleToData,
} from "../../redux/modules/maps"
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

export interface IProps {}

export interface IStoreProps {
    muiThemePalette: IMUIThemePalette
    mapDefinition: IMap
    layerId: number
    layerDefinition: ILayer
    tabName: string
    columninfo: IColumnInfo
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
    fields: Array<{ field: string; value: any }>
}

export class ValueExpressionEditorContainer extends React.Component<
    IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps,
    IState
> {
    onFieldChangeDebounced: Function

    constructor(props: IDispatchProps & IRouterProps) {
        super(props)
        this.state = { fields: [] }
        // const { onFieldUpdate } = props

        // // http://stackoverflow.com/a/24679479/7368493
        // this.onFieldChangeDebounced = debounce(function(fieldName: string, newValue: any, mapId: number, layerId: number) {
        //     onFieldUpdate(fieldName, newValue, mapId, layerId)
        // }, 500)

        props.router.setRouteLeaveHook(props.route, this.routerWillLeave.bind(this))
    }

    componentWillMount() {
        const { mapDefinition, layerId, /*startLayerEditSession,*/ layerDefinition } = this.props

        // Start a new layer edit session whenever the form is initialised.
        // (This happens for each layer we load the form for.)
        // startLayerEditSession(mapDefinition.id, layerId)
    }

    routerWillLeave(nextLocation: any) {
        return true

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

    // shouldComponentUpdate(nextProps: IStoreProps) {

    // }

    render() {
        const { muiThemePalette, mapDefinition, layerId, layerDefinition, tabName, columninfo } = this.props
        const { fields } = this.state
        // console.log("fields", fields)

        return (
            <ValueExpressionEditor
                muiThemePalette={muiThemePalette}
                mapId={mapDefinition.id}
                mapNameURLSafe={mapDefinition["name-url-safe"]}
                layerDefinition={layerDefinition}
                layerId={layerId}
                layerHash={layerDefinition.hash || ""}
                tabName={tabName}
                columninfo={columninfo}
                onFieldChange={(payload: { field: string; value: any }) => {
                    const idx: any = this.state.fields.findIndex((value: { field: string; value: any }) => value.field == payload.field)
                    if (idx === -1) {
                        fields.push(payload)
                    } else {
                        fields[idx] = payload
                    }
                    this.setState({ fields: fields })
                }}
                fields={fields}
                onApply={() => {
                    console.log("onApply", this.state.fields)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app, maps, ealgis } = state

    return {
        muiThemePalette: ownProps.muiTheme.palette,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        layerDefinition: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        tabName: ownProps.params.tabName,
        columninfo: ealgis.columninfo,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const ValueExpressionEditorContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(ValueExpressionEditorContainer)

export default muiThemeable()(withRouter(ValueExpressionEditorContainerWrapped))
