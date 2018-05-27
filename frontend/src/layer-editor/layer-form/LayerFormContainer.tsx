import { values as objectValues } from "core-js/library/fn/object"
import { debounce, isEqual, reduce } from "lodash-es"
import muiThemeable from "material-ui/styles/muiThemeable"
import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { change, formValueSelector, initialize, isDirty } from "redux-form"
import { setActiveContentComponent } from "../../redux/modules/app"
import { finishBrowsing } from "../../redux/modules/databrowser"
import {
    IColourInfo,
    IGeomInfo,
    IGeomTable,
    ILayer,
    ILayerQuerySummary,
    IMUITheme,
    IMUIThemePalette,
    IMap,
    ISelectedColumn,
    IStore,
    eEalUIComponent,
    eLayerFilterExpressionMode,
    eLayerValueExpressionMode,
} from "../../redux/modules/interfaces"
import { fitLayerScaleToData, handleLayerFormChange } from "../../redux/modules/maps"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { getMapURL } from "../../shared/utils"
import LayerForm from "./LayerForm"

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
    filterExpressionMode: eLayerFilterExpressionMode
    geometry: string // JSON IGeomTable
    name: string
    scaleMax: string
    scaleMin: string
    valueExpression: string
    valueExpressionMode: eLayerValueExpressionMode
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
    onSubmitFail: Function
    onFieldUpdate: Function
    onFormChange: Function
    onFitScaleToData: Function
    onFormComplete: Function
    onResetForm: Function
    handleRemoveColumn: Function
    onApplyValueExpression: Function
    onApplyFilterExpression: Function
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
        filterExpressionMode: layer["fill"]["conditional_mode"] || eLayerFilterExpressionMode.NOT_SET,
        geometry: JSON.stringify(geominfo[layer["schema"] + "." + layer["geometry"]]),
        name: layer["name"],
        scaleMax: layer["fill"]["scale_max"].toString(),
        scaleMin: layer["fill"]["scale_min"].toString(),
        valueExpression: layer["fill"]["expression"],
        valueExpressionMode: layer["fill"]["expression_mode"] || eLayerValueExpressionMode.NOT_SET,
        selectedColumns: layer["selectedColumns"],
    }
}

const getLayerFromLayerFormValues = (formValues: ILayerFormValues): ILayer => {
    const geometry: IGeomTable = "geometry" in formValues ? JSON.parse(formValues["geometry"]) : null

    return {
        fill: {
            opacity: formValues["fillOpacity"],
            scale_max: parseFloat(formValues["scaleMax"]),
            scale_min: parseFloat(formValues["scaleMin"]),
            expression: formValues["valueExpression"] ? formValues["valueExpression"] : "",
            expression_mode: formValues["valueExpressionMode"] ? formValues["valueExpressionMode"] : eLayerValueExpressionMode.NOT_SET,
            scale_flip: formValues["fillColourScaleFlip"] ? formValues["fillColourScaleFlip"] : false,
            scale_name: formValues["fillColourScheme"],
            conditional: formValues["filterExpression"] ? formValues["filterExpression"] : "",
            conditional_mode: formValues["filterExpressionMode"] ? formValues["filterExpressionMode"] : eLayerFilterExpressionMode.NOT_SET,
            scale_nlevels: formValues["fillColourSchemeLevels"],
        },
        line: {
            width: formValues["borderSize"],
            colour: formValues["borderColour"],
        },
        name: formValues["name"],
        type: geometry !== null ? geometry["geometry_type"] : null,
        schema: geometry !== null ? geometry["schema_name"] : null,
        visible: true,
        geometry: geometry !== null ? geometry["name"] : null,
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
        case "valueExpressionMode":
            return "expression_mode"
        case "fillColourScaleFlip":
            return "scale_flip"
        case "fillColourScheme":
            return "scale_name"
        case "filterExpression":
            return "conditional"
        case "filterExpressionMode":
            return "conditional_mode"
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
        case "valueExpressionMode":
        case "fillColourScaleFlip":
        case "fillColourScheme":
        case "filterExpression":
        case "filterExpressionMode":
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
    initialValues!: object

    constructor(props: IProps & IStoreProps & IDispatchProps & IRouterProps & IRouteProps) {
        super(props)
        const { onFieldUpdate } = props

        // http://stackoverflow.com/a/24679479/7368493
        this.onFieldChangeDebounced = debounce(function(fieldName: string, newValue: any, mapId: number, layerId: number) {
            onFieldUpdate(fieldName, newValue, mapId, layerId)
        }, 500)
    }

    componentWillMount() {
        const { mapDefinition, layerId, layerDefinition, geominfo } = this.props

        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        this.initialValues = JSON.parse(JSON.stringify(getLayerFormValuesFromLayer(layerDefinition, geominfo)))
    }

    shouldComponentUpdate(nextProps: IStoreProps) {
        const {
            tabName,
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

        // We've changed tabs in the form
        if (tabName !== nextProps.tabName) {
            return true
        }

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
        // e.g. If we get a new layerDefinition with new border colours that needs to flow through to ColourPicker.
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
            onSubmitFail,
            onFieldUpdate,
            geominfo,
            colourinfo,
            onFormComplete,
            onResetForm,
            handleRemoveColumn,
            onApplyValueExpression,
            onApplyFilterExpression,
            deactivateDataBrowser,
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
                layerHash={layerDefinition.hash}
                layerFillColourScheme={layerFillColourScheme}
                visibleComponent={visibleComponent}
                dirtyFormModalOpen={dirtyFormModalOpen}
                isDirty={isDirty}
                geominfo={geominfo}
                colourinfo={colourinfo}
                layerFormSubmitting={layerFormSubmitting}
                initialValues={this.initialValues}
                onSubmitFail={(errors: object, dispatch: Function, submitError: Error, props: object) =>
                    onSubmitFail(errors, submitError, props)
                }
                onFieldBlur={(fieldName: string, newValue: any, previousValue: any) =>
                    onFieldUpdate(fieldName, newValue, mapDefinition.id, layerId)
                }
                onFieldChange={(fieldName: string, newValue: any) =>
                    this.onFieldChangeDebounced(fieldName, newValue, mapDefinition.id, layerId)
                }
                onFormChange={(values: ILayerFormValues, dispatch: Function, props: any) => onFormChange(values, dispatch, props)}
                onFitScaleToData={(stats: ILayerQuerySummary) => onFitScaleToData(mapDefinition.id, layerId, stats)}
                onFormComplete={() => {
                    onFormComplete(mapDefinition)
                    deactivateDataBrowser()
                }}
                onResetForm={() => onResetForm(mapDefinition.id, layerId, this.initialValues)}
                onRemoveColumn={(selectedColumn: ISelectedColumn) => handleRemoveColumn(layerDefinition, selectedColumn)}
                onApplyValueExpression={(expression: string, expression_mode: eLayerValueExpressionMode) => {
                    onApplyValueExpression(expression, expression_mode, mapDefinition.id, layerId)
                }}
                onApplyFilterExpression={(expression: string, expression_mode: eLayerFilterExpressionMode) => {
                    onApplyFilterExpression(expression, expression_mode, mapDefinition.id, layerId)
                }}
                onCloseLayer={() => {
                    deactivateDataBrowser()
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
    //         const columnUID = `${columnStub["schema"]}.${columnStub["id"]}`
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
        onSubmitFail: (errors: object, submitError: Error, props: object) => {
            const fieldNames = Object.keys(errors)
            dispatch(sendSnackbarNotification(`Some fields have errors (${fieldNames.join(", ")})`))
        },
        onFieldUpdate: (fieldName: string, newValue: any, mapId: number, layerId: number) => {
            let formValues: object = {}

            // The Fill Colour Scheme field submits an object as its value
            // containing both the Colour Scheme and Number of Levels.
            // This is so we can keep the Fill Colour Scheme Level in the
            // valid range for this given colour scheme.
            if (fieldName === "fillColourScheme") {
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
        onFormComplete: (map: IMap) => {
            browserHistory.push(getMapURL(map))
        },
        onResetForm: (mapId: number, layerId: number, initialLayerFormValues: ILayerFormValues) => {
            dispatch(initialize("layerForm", initialLayerFormValues, false))
            const layerPartial = getLayerFromLayerFormValues(initialLayerFormValues)
            dispatch(handleLayerFormChange(layerPartial, mapId, layerId))
        },
        handleRemoveColumn: (layer: ILayer, selectedColumn: ISelectedColumn) => {
            layer.selectedColumns.splice(layer.selectedColumns.findIndex(columnStub => columnStub === selectedColumn), 1)
            dispatch(change("layerForm", "selectedColumns", layer.selectedColumns))
        },
        onApplyValueExpression: (expression: string, expression_mode: eLayerValueExpressionMode, mapId: number, layerId: number) => {
            dispatch(change("layerForm", "valueExpression", expression))
            dispatch(change("layerForm", "valueExpressionMode", expression_mode))

            const layerPartial = getLayerFromLayerFormValuesPartial({
                valueExpression: expression,
                valueExpressionMode: expression_mode,
            })
            dispatch(handleLayerFormChange(layerPartial, mapId, layerId))
        },
        onApplyFilterExpression: (expression: string, expression_mode: eLayerFilterExpressionMode, mapId: number, layerId: number) => {
            dispatch(change("layerForm", "filterExpression", expression))
            dispatch(change("layerForm", "filterExpressionMode", expression_mode))

            const layerPartial = getLayerFromLayerFormValuesPartial({
                filterExpression: expression,
                filterExpressionMode: expression_mode,
            })
            dispatch(handleLayerFormChange(layerPartial, mapId, layerId))
        },
        deactivateDataBrowser: () => {
            dispatch(setActiveContentComponent(eEalUIComponent.MAP_UI))
            dispatch(finishBrowsing())
        },
    }
}

// Caused by muiThemable() https://github.com/mui-org/material-ui/issues/5975 - resolved in MaterialUI 1.0
// @ts-ignore
const LayerFormContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    LayerFormContainer
)

export default muiThemeable()(LayerFormContainerWrapped)
