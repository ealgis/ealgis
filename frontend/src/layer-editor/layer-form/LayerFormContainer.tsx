import * as React from "react"
import { connect } from "react-redux"
import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { withRouter } from "react-router"
import { isEqual, debounce, reduce } from "lodash-es"
import { values as objectValues } from "core-js/library/fn/object"
import LayerForm from "./LayerForm"
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
    IMap,
    ILayer,
    ISelectedColumn,
    IMUITheme,
    IMUIThemePalette,
} from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

export interface ILayerFormValues {
    borderColour: {
        a: number
        r: number
        g: number
        b: number
    }
    borderSize: number
    description: string
    fillColourScaleFlip: boolean
    fillColourScheme: string
    fillColourSchemeLevels: number
    fillOpacity: number
    filterExpression: string
    geometry: string // JSON IGeomTable
    name: string
    scaleMax: number
    scaleMin: number
    valueExpression: string
    selectedColumns: Array<ISelectedColumn>
}

export interface IProps {}

export interface IStoreProps {
    tabName: string
    mapDefinition: IMap
    layerId: number
    layerDefinition: ILayer
    layerFillColourScheme: string
    visibleComponent: string
    dirtyFormModalOpen: boolean
    isDirty: boolean
    geominfo: IGeomInfo
    colourinfo: IColourInfo
    layerFormSubmitting: boolean
    muiThemePalette: IMUIThemePalette
}

export interface IDispatchProps {
    startLayerEditSession: Function
    onSubmit: Function
    onSubmitFail: Function
    onFieldUpdate: Function
    onFormChange: Function
    onFitScaleToData: Function
    onSaveForm: Function
    onResetForm: Function
    onModalSaveForm: Function
    onModalDiscardForm: Function
    onToggleDirtyFormModalState: Function
    handleRemoveColumn: Function
    onApplyValueExpression: Function
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
    component: string
}

interface IOwnProps {
    params: IRouteProps
    muiTheme: IMUITheme
}

const getLayerFormValuesFromLayer = (layer: ILayer, geominfo: IGeomInfo): ILayerFormValues => {
    return {
        borderColour: layer["line"]["colour"],
        borderSize: layer["line"]["width"],
        description: layer["description"],
        fillColourScaleFlip: layer["fill"]["scale_flip"],
        fillColourScheme: layer["fill"]["scale_name"],
        fillColourSchemeLevels: layer["fill"]["scale_nlevels"],
        fillOpacity: layer["fill"]["opacity"],
        filterExpression: layer["fill"]["conditional"],
        geometry: JSON.stringify(geominfo[layer["schema"] + "." + layer["geometry"]]),
        name: layer["name"],
        scaleMax: layer["fill"]["scale_max"],
        scaleMin: layer["fill"]["scale_min"],
        valueExpression: layer["fill"]["expression"],
        selectedColumns: layer["selectedColumns"],
    }
}

const getLayerFromLayerFormValues = (formValues: ILayerFormValues): ILayer => {
    const geometry: IGeomTable = JSON.parse(formValues["geometry"])

    return {
        fill: {
            opacity: formValues["fillOpacity"],
            scale_max: formValues["scaleMax"],
            scale_min: formValues["scaleMin"],
            expression: formValues["valueExpression"] ? formValues["valueExpression"] : "",
            scale_flip: formValues["fillColourScaleFlip"] ? formValues["fillColourScaleFlip"] : false,
            scale_name: formValues["fillColourScheme"],
            conditional: formValues["filterExpression"] ? formValues["filterExpression"] : "",
            scale_nlevels: formValues["fillColourSchemeLevels"],
        },
        line: {
            width: formValues["borderSize"],
            colour: formValues["borderColour"],
        },
        name: formValues["name"],
        type: geometry["geometry_type"],
        schema: geometry["schema_name"],
        visible: true,
        geometry: geometry["name"],
        description: formValues["description"],
        selectedColumns: formValues["selectedColumns"],
    }
}

const mapLayerFormFieldNameToLayerProp = (fieldName: string) => {
    switch (fieldName) {
        case "fillOpacity":
            return "opacity"
        case "scaleMax":
            return "scale_max"
        case "scaleMin":
            return "scale_min"
        case "valueExpression":
            return "expression"
        case "fillColourScaleFlip":
            return "scale_flip"
        case "fillColourScheme":
            return "scale_name"
        case "filterExpression":
            return "conditional"
        case "fillColourSchemeLevels":
            return "scale_nlevels"
        case "borderSize":
            return "width"
        case "borderColour":
            return "colour"
        case "selectedColumns":
            return "selectedColumns"
        default:
            return fieldName
    }
}

const mapLayerFormValuesToLayer = (layer: any, fieldName: string, fieldValue: any) => {
    const layerPropName = mapLayerFormFieldNameToLayerProp(fieldName)

    switch (fieldName) {
        case "fillOpacity":
        case "scaleMax":
        case "scaleMin":
        case "valueExpression":
        case "fillColourScaleFlip":
        case "fillColourScheme":
        case "filterExpression":
        case "fillColourSchemeLevels":
            if (layer["fill"] === undefined) {
                layer["fill"] = {}
            }
            layer["fill"][layerPropName] = fieldValue
            break

        case "borderSize":
        case "borderColour":
            if (layer["line"] === undefined) {
                layer["line"] = {}
            }
            layer["line"][layerPropName] = fieldValue
            break

        case "geometry":
            const geometry = JSON.parse(fieldValue)
            layer["type"] = geometry["geometry_type"]
            layer["schema"] = geometry["schema_name"]
            layer["geometry"] = geometry["name"]
            break

        default:
            layer[layerPropName] = fieldValue
    }
    return layer
}

const getLayerFromLayerFormValuesPartial = (formValues: any) => {
    let layer = {}
    for (let fieldName in formValues) {
        const fieldValue = formValues[fieldName]
        layer = mapLayerFormValuesToLayer(layer, fieldName, fieldValue)
    }
    return layer
}

export class LayerFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps, {}> {
    onFieldChangeDebounced: Function
    initialValues: object

    constructor(props: IDispatchProps & IRouterProps) {
        super(props)
        const { onFieldUpdate } = props

        // http://stackoverflow.com/a/24679479/7368493
        this.onFieldChangeDebounced = debounce(function(fieldName: string, newValue: any, mapId: number, layerId: number) {
            onFieldUpdate(fieldName, newValue, mapId, layerId)
        }, 500)

        props.router.setRouteLeaveHook(props.route, this.routerWillLeave.bind(this))
    }

    componentWillMount() {
        const { mapDefinition, layerId, startLayerEditSession, layerDefinition, geominfo } = this.props

        // Start a new layer edit session whenever the form is initialised.
        // (This happens for each layer we load the form for.)
        startLayerEditSession(mapDefinition.id, layerId)

        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        this.initialValues = JSON.parse(JSON.stringify(getLayerFormValuesFromLayer(layerDefinition, geominfo)))
    }

    routerWillLeave(nextLocation: any) {
        const { mapDefinition, layerId, isDirty, onToggleDirtyFormModalState } = this.props

        // Prompt the user to discard/save their changes if we're navigate away from the layer form
        if (!nextLocation.pathname.startsWith(`/map/${mapDefinition.id}/${mapDefinition["name-url-safe"]}/layer/${layerId}`)) {
            // return false to prevent a transition w/o prompting the user,
            // or return a string to allow the user to decide:
            if (isDirty) {
                onToggleDirtyFormModalState()
                // return 'Your layer is not saved! Are you sure you want to leave?'
                return false
            }
        }
    }

    shouldComponentUpdate(nextProps: IStoreProps) {
        const {
            mapDefinition,
            layerId,
            layerFillColourScheme,
            visibleComponent,
            layerDefinition,
            dirtyFormModalOpen,
            layerFormSubmitting,
            isDirty,
        } = this.props
        // Re-render LayerForm if...

        // We've changed the map or layer we're looking at
        if (mapDefinition.id != nextProps.mapDefinition.id || layerId != nextProps.layerId) {
            return true
        }

        // We need to display a different visible component
        if (visibleComponent !== nextProps.visibleComponent) {
            return true
        }

        // We're saving/undoing changes or we've chnaged our dirty state
        if (layerFormSubmitting != nextProps.layerFormSubmitting || isDirty != nextProps.isDirty) {
            return true
        }

        // Some sub-components require the form to re-render.
        // Fill Colour Scheme: Controls the values of Fill Colour Scheme Levels
        if (layerFillColourScheme !== nextProps.layerFillColourScheme) {
            return true
        }

        // Again, for sub-components. This ensures that when the layerDefinition changes that we also refresh them.
        // e.g. If we restoreMasterLayer we get a new layerDefinition with new border colours that needs to
        // flow through to ColourPicker.
        if (!isEqual(layerDefinition, nextProps.layerDefinition)) {
            // If the ONLY thing that changes is olStyle (the OpenLayers style function) then don't bother to re-render
            // FIXME Having a function shoved on the layerDef and having that drip down to the layer editing form feels...icky.
            const diff = reduce(
                layerDefinition,
                function(result: any, value: any, key: string) {
                    return isEqual(value, nextProps.layerDefinition[key]) ? result : result.concat(key)
                },
                []
            )

            if (!isEqual(objectValues(diff), ["olStyle"])) {
                return true
            }
        }

        // We need to open or close the dirty form modal
        if (dirtyFormModalOpen != nextProps.dirtyFormModalOpen) {
            return true
        }
        return false
    }

    render() {
        const {
            layerId,
            tabName,
            mapDefinition,
            layerDefinition,
            visibleComponent,
            onSubmit,
            onSubmitFail,
            onFieldUpdate,
            geominfo,
            colourinfo,
            onSaveForm,
            onResetForm,
            onModalSaveForm,
            onModalDiscardForm,
            handleRemoveColumn,
            onApplyValueExpression,
            dirtyFormModalOpen,
            isDirty,
            onFitScaleToData,
            layerFillColourScheme,
            onFormChange,
            layerFormSubmitting,
            muiThemePalette,
        } = this.props

        return (
            <LayerForm
                muiThemePalette={muiThemePalette}
                tabName={tabName}
                mapId={mapDefinition.id}
                mapNameURLSafe={mapDefinition["name-url-safe"]}
                layerId={layerId}
                layerHash={layerDefinition.hash || ""}
                layerFillColourScheme={layerFillColourScheme}
                visibleComponent={visibleComponent}
                dirtyFormModalOpen={dirtyFormModalOpen}
                isDirty={isDirty}
                geominfo={geominfo}
                colourinfo={colourinfo}
                layerFormSubmitting={layerFormSubmitting}
                initialValues={this.initialValues}
                onSubmit={(formValues: Array<any>) => onSubmit(mapDefinition.id, layerId, formValues, layerDefinition)}
                onSubmitFail={(errors: object, dispatch: Function, submitError: Error, props: object) =>
                    onSubmitFail(errors, submitError, props)}
                onFieldBlur={(fieldName: string, newValue: any, previousValue: any) =>
                    onFieldUpdate(fieldName, newValue, mapDefinition.id, layerId)}
                onFieldChange={(fieldName: string, newValue: any) =>
                    this.onFieldChangeDebounced(fieldName, newValue, mapDefinition.id, layerId)}
                onFormChange={(values: ILayerFormValues, dispatch: Function, props: any) => onFormChange(values, dispatch, props)}
                onFitScaleToData={(stats: ILayerQuerySummary) => onFitScaleToData(mapDefinition.id, layerId, stats)}
                onSaveForm={() => onSaveForm(mapDefinition.id, layerId, isDirty)}
                onResetForm={() => onResetForm(mapDefinition.id, layerId, this.initialValues)}
                onModalSaveForm={() => onModalSaveForm(mapDefinition.id, layerId)}
                onModalDiscardForm={() => onModalDiscardForm(mapDefinition.id, layerId, this.initialValues)}
                onRemoveColumn={(selectedColumn: ISelectedColumn) => handleRemoveColumn(layerDefinition, selectedColumn)}
                onApplyValueExpression={(expression: string) => {
                    onApplyValueExpression(expression, mapDefinition.id, layerId)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app, maps, ealgis, layerform } = state
    const layerFormValues = formValueSelector("layerForm")

    // For chip input-based expression editors (if needed)
    // const selectedColumnStubs: Array<ISelectedColumn> = layerFormValues(state, "selectedColumns")
    // if (selectedColumnStubs !== undefined) {
    //     let selectedColumns: Array<IColumn> = selectedColumnStubs.map((columnStub: ISelectedColumn) => {
    //         const columnUID = `${columnStub["schema"]}-${columnStub["id"]}`
    //         return ealgis.columninfo[columnUID]
    //     })
    // }

    return {
        tabName: ownProps.params.tabName,
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        layerDefinition: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        layerFillColourScheme: layerFormValues(state, "fillColourScheme") as string,
        visibleComponent: ownProps.params.component,
        dirtyFormModalOpen: app.modals.get("dirtyLayerForm") || false,
        isDirty: isDirty("layerForm")(state),
        geominfo: ealgis.geominfo,
        colourinfo: ealgis.colourinfo,
        layerFormSubmitting: layerform.submitting,
        muiThemePalette: ownProps.muiTheme.palette,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        startLayerEditSession: (mapId: number, layerId: number) => {
            dispatch(startLayerEditing())
            dispatch(initDraftLayer(mapId, layerId))
        },
        onSubmit: (mapId: number, layerId: number, layerFormValues: ILayerFormValues, layerDefinition: any) => {
            const layer: ILayer = getLayerFromLayerFormValues(layerFormValues)
            layer.selectedColumns = layerDefinition.selectedColumns
            dispatch(publishLayer(mapId, layerId, layer))
            dispatch(initialize("layerForm", layerFormValues, false))
        },
        onSubmitFail: (errors: object, submitError: Error, props: object) => {
            const fieldNames = Object.keys(errors)
            dispatch(sendSnackbarNotification(`Some fields have errors (${fieldNames.join(", ")})`))
        },
        onFieldUpdate: (fieldName: string, newValue: any, mapId: number, layerId: number) => {
            let formValues: object = {}
            // The Fill Colour Scheme and Border fields are controlled by two <Fields> components
            // and submit their value as an object containing both fields.
            if (
                fieldName === "fillColourScheme" ||
                fieldName === "fillColourSchemeLevels" ||
                fieldName === "borderColour" ||
                fieldName === "borderSize"
            ) {
                formValues = newValue
            } else {
                formValues = { [fieldName]: newValue }
            }

            const layerPartial = getLayerFromLayerFormValuesPartial(formValues)
            dispatch(handleLayerFormChange(layerPartial, mapId, layerId))
        },
        onFormChange: (values: ILayerFormValues, dispatch: Function, props: any) => {
            const colourSchemeLevels = props.colourinfo[values["fillColourScheme"]] ? props.colourinfo[values["fillColourScheme"]] : []
            const firstColourSchemeLevel = colourSchemeLevels[0]
            const lastColourSchemeLevel = colourSchemeLevels.slice(-1)[0]

            if (values["fillColourSchemeLevels"] > lastColourSchemeLevel) {
                dispatch(change("layerForm", "fillColourSchemeLevels", lastColourSchemeLevel))
            } else if (values["fillColourSchemeLevels"] < firstColourSchemeLevel) {
                dispatch(change("layerForm", "fillColourSchemeLevels", firstColourSchemeLevel))
            }
        },
        onFitScaleToData: (mapId: number, layerId: number, stats: ILayerQuerySummary) => {
            dispatch(fitLayerScaleToData())
            dispatch(change("layerForm", "scaleMin", stats.min))
            dispatch(change("layerForm", "scaleMax", stats.max))

            const layerPartial = getLayerFromLayerFormValuesPartial({
                scaleMin: stats.min,
                scaleMax: stats.max,
            })
            dispatch(handleLayerFormChange(layerPartial, mapId, layerId))
        },
        onSaveForm: (mapId: number, layerId: number, isDirty: boolean) => {
            dispatch(submit("layerForm"))
        },
        onResetForm: (mapId: number, layerId: number, initialLayerFormValues: object) => {
            dispatch(initialize("layerForm", initialLayerFormValues, false))
            dispatch(restoreMasterLayer(mapId, layerId))
            dispatch(initDraftLayer(mapId, layerId))
        },
        onModalSaveForm: (mapId: number, layerId: number) => {
            dispatch(submit("layerForm"))
            dispatch(toggleModalState("dirtyLayerForm"))
        },
        onModalDiscardForm: (mapId: number, layerId: number, initialLayerFormValues: object) => {
            dispatch(initialize("layerForm", initialLayerFormValues, false))
            dispatch(restoreMasterLayerAndDiscardForm(mapId, layerId))
            dispatch(toggleModalState("dirtyLayerForm"))
        },
        onToggleDirtyFormModalState: () => {
            dispatch(toggleModalState("dirtyLayerForm"))
        },
        handleRemoveColumn: (layer: ILayer, selectedColumn: ISelectedColumn) => {
            layer.selectedColumns.splice(layer.selectedColumns.findIndex(columnStub => columnStub === selectedColumn), 1)
            dispatch(change("layerForm", "selectedColumns", layer.selectedColumns))
        },
        onApplyValueExpression: (expression: string, mapId: number, layerId: number) => {
            dispatch(change("layerForm", "valueExpression", expression))

            const layerPartial = getLayerFromLayerFormValuesPartial({
                valueExpression: expression,
            })
            dispatch(handleLayerFormChange(layerPartial, mapId, layerId))
        },
    }
}

const LayerFormContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(LayerFormContainer)

export default muiThemeable()(withRouter(LayerFormContainerWrapped))
