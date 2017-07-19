import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import RaisedButton from "material-ui/RaisedButton"
import FlatButton from "material-ui/FlatButton"
import { Tabs, Tab } from "material-ui/Tabs"
import Dialog from "material-ui/Dialog"
import ContentCreate from "material-ui/svg-icons/content/create"
import EditorInsertChart from "material-ui/svg-icons/editor/insert-chart"
import ImagePalette from "material-ui/svg-icons/image/palette"
import NavigationClose from "material-ui/svg-icons/navigation/close"
import DatasetSearch from "../dataset-search/DatasetSearchContainer"
import DataBrowserDialog from "../../data-browser/data-browser-dialog/DataBrowserDialogContainer"
import LayerQuerySummary from "../layer-query-summary/LayerQuerySummaryContainer"
import {
    IStore,
    IEALGISModule,
    ILayerQuerySummary,
    IGeomInfo,
    IGeomTable,
    IColourInfo,
    IMap,
    ILayer,
    IMUIThemePalette,
} from "../../redux/modules/interfaces"

import { Field, Fields, Config, reduxForm } from "redux-form"
import { SelectField, TextField, Checkbox, Slider } from "redux-form-material-ui"
import ColourPicker from "../../shared/ui/colour-picker/ColourPickerContainer"
import AlphaPicker from "../../shared/ui/alpha-picker/AlphaPickerContainer"

import Divider from "material-ui/Divider"
import MenuItem from "material-ui/MenuItem"

import IconButton from "material-ui/IconButton"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"

const required = (value: any) => (value || value === 0 ? undefined : "Required")

const TabContainer = styled.div`margin: 10px;`

const HiddenButton = styled.button`display: none;`

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
    justify-content: center;
    align-items: center;
`

const FirstFlexboxColumn = styled.div`
    flex: 1;
    margin-right: 20px;
`

const SecondFlexboxColumn = styled.div`flex: 1;`

const FauxFieldLabel = styled.h5`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.3);
    margin-bottom: 10px;
    transform: scale(1) translate(0px, -4px);
    transform-origin: left top 0px;
`

const FillOpacityPickerContainer = styled.div`
    margin-bottom: 0px;
    margin-top: 0px;
`

const styles: React.CSSProperties = {
    fauxFiedlLabel: {
        fontSize: "12px",
        color: "rgba(0, 0, 0, 0.3)",
        marginBottom: "10px",
        transform: "scale(1) translate(0px, -4px)",
        transformOrigin: "left top 0px",
    },
    borderSizeSlider: {
        marginBottom: "0px",
        marginTop: "0px",
    },
}

const BorderSizeAndColourFields = (fields: any) => {
    return (
        <FlexboxContainer>
            <FirstFlexboxColumn>
                <FauxFieldLabel>Border colour</FauxFieldLabel>
                <Field
                    name="borderColour"
                    component={ColourPicker}
                    color={fields.initialBorderColour}
                    onChange={(junk: object, newValue: object, previousValue: object) =>
                        fields.onFieldChange("borderColour", {
                            borderColour: newValue,
                            borderSize: fields["borderSize"].input.value,
                        })}
                />
            </FirstFlexboxColumn>

            <SecondFlexboxColumn>
                <FauxFieldLabel>Border size</FauxFieldLabel>
                <Field
                    name="borderSize"
                    component={Slider}
                    validate={[required]}
                    min={0}
                    max={10}
                    sliderStyle={styles.borderSizeSlider}
                    step={1}
                    onChange={(event: any, newValue: string, previousValue: string) =>
                        fields.onFieldChange("borderSize", {
                            borderColour: fields["borderColour"],
                            borderSize: newValue,
                        })}
                />
            </SecondFlexboxColumn>
        </FlexboxContainer>
    )
}

const FillColourSchemeFields = (fields: any) => {
    const colourSchemeLevels = fields.colourinfo[fields["fillColourScheme"].input.value]
        ? fields.colourinfo[fields["fillColourScheme"].input.value]
        : []

    return (
        <FlexboxContainer>
            <FirstFlexboxColumn>
                <Field
                    name="fillColourScheme"
                    component={SelectField}
                    hintText="Choose your colour scheme..."
                    floatingLabelText="Fill colour scheme"
                    floatingLabelFixed={true}
                    validate={[required]}
                    fullWidth={true}
                    onChange={(junk: object, newValue: string, previousValue: string) => {
                        // There's two gotchas here:
                        // 1. redux-form-material-ui doesn't pass (event, newValue, previousValue) for SelectFields like it does for other field types. Hence the `junk` argument and repeating the field name.
                        // 2. We were (seemingly) seeing onChange firing before the application state had been updated with the new value for this SelectField. We'll work around this by using the debounced version.

                        const colourSchemeLevels = fields.colourinfo[newValue] ? fields.colourinfo[newValue] : []
                        const firstColourSchemeLevel = colourSchemeLevels[0]
                        const lastColourSchemeLevel = colourSchemeLevels.slice(-1)[0]

                        let fillColourSchemeLevel = fields["fillColourSchemeLevels"].input.value
                        if (fields["fillColourSchemeLevels"].input.value > lastColourSchemeLevel) {
                            fillColourSchemeLevel = lastColourSchemeLevel
                        } else if (fields["fillColourSchemeLevels"].input.value < firstColourSchemeLevel) {
                            fillColourSchemeLevel = firstColourSchemeLevel
                        }

                        fields.onFieldChange("fillColourScheme", {
                            fillColourScheme: newValue,
                            fillColourSchemeLevels: fillColourSchemeLevel,
                        })
                    }}
                >
                    {Object.keys(fields.colourinfo).map((colourLevel: any, key: any) =>
                        <MenuItem key={key} value={colourLevel} primaryText={colourLevel} />
                    )}
                </Field>
            </FirstFlexboxColumn>

            <SecondFlexboxColumn>
                <Field
                    name="fillColourSchemeLevels"
                    component={SelectField}
                    hintText="Choose the number of colour levels..."
                    floatingLabelText="Fill colour levels"
                    floatingLabelFixed={true}
                    fullWidth={true}
                    onChange={(junk: object, newValue: string, previousValue: string) => {
                        fields.onFieldChange("fillColourSchemeLevels", {
                            fillColourScheme: fields["fillColourScheme"].input.value,
                            fillColourSchemeLevels: newValue,
                        })
                    }}
                >
                    {colourSchemeLevels.map((colourLevel: any, key: any) =>
                        <MenuItem key={key} value={colourLevel} primaryText={colourLevel} />
                    )}
                </Field>
            </SecondFlexboxColumn>
        </FlexboxContainer>
    )
}

export interface IProps {
    muiThemePalette: IMUIThemePalette
    tabName: string
    mapId: number
    mapNameURLSafe: string
    layerId: number
    layerHash: string
    layerFillColourScheme: string
    layerGeometry: IGeomTable
    dirtyFormModalOpen: boolean
    isDirty: boolean
    geominfo: IGeomInfo
    colourinfo: IColourInfo
    layerFormSubmitting: boolean
    initialValues: object
    onSubmit: Function
    onSubmitFail: Function
    onFieldBlur: Function
    onFieldChange: Function
    onFormChange: Function
    onFitScaleToData: Function
    onSaveForm: any
    onResetForm: any
    onModalSaveForm: any
    onModalDiscardForm: any
}

class LayerForm extends React.Component<IProps, {}> {
    geometryTables: Array<JSX.Element>
    colourSchemes: Array<JSX.Element>

    componentWillMount() {
        const { geominfo, colourinfo } = this.props

        this.geometryTables = []
        for (let geomtable_name in geominfo) {
            this.geometryTables.push(
                <MenuItem
                    key={geomtable_name}
                    value={JSON.stringify(geominfo[geomtable_name])}
                    primaryText={geominfo[geomtable_name].description}
                />
            )
        }

        this.colourSchemes = []
        for (let colour in colourinfo) {
            this.colourSchemes.push(<MenuItem key={colour} value={colour} primaryText={colour} />)
        }
    }

    render() {
        const { error, handleSubmit, pristine, reset, submitting, change, initialValues }: any = this.props // from react-form
        const {
            muiThemePalette,
            mapId,
            mapNameURLSafe,
            layerId,
            layerHash,
            tabName,
            onSubmit,
            onFieldBlur,
            onFieldChange,
            colourinfo,
            layerFillColourScheme,
            onSaveForm,
            onResetForm,
            onModalSaveForm,
            onModalDiscardForm,
            dirtyFormModalOpen,
            onFitScaleToData,
            layerGeometry,
            layerFormSubmitting,
            isDirty,
        } = this.props

        let tabId = 0
        switch (tabName) {
            case "data":
                tabId = 1
                break
            case "visualise":
                tabId = 2
                break
        }

        return (
            <div>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <RaisedButton
                            label={"Save"}
                            disabled={layerFormSubmitting || !isDirty}
                            primary={true}
                            onTouchTap={onSaveForm}
                        />
                        <RaisedButton
                            label={"Undo"}
                            disabled={layerFormSubmitting || !isDirty}
                            primary={true}
                            onTouchTap={onResetForm}
                        />
                    </ToolbarGroup>

                    <ToolbarGroup lastChild={true}>
                        <IconButton
                            tooltip="Close this layer and return to your map"
                            tooltipPosition="bottom-right"
                            containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}`} />}
                        >
                            <NavigationClose color={muiThemePalette.alternateTextColor} />
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Tabs
                        initialSelectedIndex={tabId}
                        tabItemContainerStyle={{ backgroundColor: muiThemePalette.accent3Color }}
                    >
                        {/* START DESCRIBE TAB */}
                        <Tab
                            icon={<ContentCreate />}
                            label="DESCRIBE"
                            containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}`} />}
                        >
                            <TabContainer>
                                <Field
                                    name="name"
                                    component={TextField}
                                    hintText="Give your layer a name..."
                                    floatingLabelText="Layer name"
                                    floatingLabelFixed={true}
                                    validate={[required]}
                                    fullWidth={true}
                                    autoComplete="off"
                                    onBlur={(event: any, newValue: string, previousValue: string) =>
                                        onFieldBlur(event.target.name, newValue, previousValue)}
                                />

                                <Field
                                    name="description"
                                    component={TextField}
                                    multiLine={true}
                                    rows={2}
                                    hintText="Give your layer a description..."
                                    floatingLabelText="Layer description"
                                    floatingLabelFixed={true}
                                    validate={[required]}
                                    fullWidth={true}
                                    autoComplete="off"
                                    onBlur={(event: any, newValue: string, previousValue: string) =>
                                        onFieldBlur(event.target.name, newValue, previousValue)}
                                />

                                <Field
                                    name="geometry"
                                    component={SelectField}
                                    hintText="Choose your geometry..."
                                    floatingLabelText="Geometry"
                                    floatingLabelFixed={true}
                                    validate={[required]}
                                    fullWidth={true}
                                    onChange={(junk: object, newValue: object, previousValue: object) =>
                                        onFieldChange("geometry", newValue)}
                                >
                                    {this.geometryTables}
                                </Field>
                            </TabContainer>
                        </Tab>
                        {/* END DESCRIBE TAB */}

                        {/* START DATA TAB */}
                        <Tab
                            icon={<EditorInsertChart />}
                            label="DATA"
                            containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                        >
                            <TabContainer>
                                <DataBrowserDialog />
                                
                                <Field
                                    name="valueExpression"
                                    component={TextField}
                                    multiLine={true}
                                    rows={2}
                                    hintText="Write an expression..."
                                    floatingLabelText="Value expression"
                                    floatingLabelFixed={true}
                                    fullWidth={true}
                                    autoComplete="off"
                                    onBlur={(event: any, newValue: string, previousValue: string) =>
                                        onFieldBlur(event.target.name, newValue, previousValue)}
                                />

                                <Field
                                    name="filterExpression"
                                    component={TextField}
                                    multiLine={true}
                                    rows={2}
                                    hintText="Write a filter expression..."
                                    floatingLabelText="Filter expression"
                                    floatingLabelFixed={true}
                                    fullWidth={true}
                                    autoComplete="off"
                                    onBlur={(event: any, newValue: string, previousValue: string) =>
                                        onFieldBlur(event.target.name, newValue, previousValue)}
                                />

                                <DatasetSearch geometry={layerGeometry} />
                            </TabContainer>
                        </Tab>
                        {/* END DATA TAB */}

                        {/* START VISUALISE TAB */}
                        <Tab
                            icon={<ImagePalette />}
                            label="VISUALISE"
                            containerElement={
                                <Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/visualise`} />
                            }
                        >
                            <TabContainer>
                                <Fields
                                    names={["borderColour", "borderSize"]}
                                    component={BorderSizeAndColourFields}
                                    onFieldChange={onFieldChange}
                                    initialBorderColour={initialValues["borderColour"]}
                                />

                                <Fields
                                    names={["fillColourScheme", "fillColourSchemeLevels"]}
                                    component={FillColourSchemeFields}
                                    onFieldChange={onFieldChange}
                                    colourinfo={colourinfo}
                                />

                                <FlexboxContainer>
                                    <FirstFlexboxColumn>
                                        <Field
                                            name="fillColourScaleFlip"
                                            component={Checkbox}
                                            label={"Flip colours"}
                                            labelPosition={"left"}
                                            labelStyle={styles.fauxFiedlLabel}
                                            onChange={(event: any, newValue: string, previousValue: string) =>
                                                onFieldChange("fillColourScaleFlip", newValue)}
                                        />
                                    </FirstFlexboxColumn>

                                    <SecondFlexboxColumn>
                                        <FauxFieldLabel>Fill opacity</FauxFieldLabel>
                                        <FillOpacityPickerContainer>
                                            <Field
                                                name="fillOpacity"
                                                component={AlphaPicker}
                                                rgb={{ r: 0, g: 0, b: 0, a: initialValues["fillOpacity"] }}
                                                onChange={(event: any, newValue: object, previousValue: object) =>
                                                    onFieldChange("fillOpacity", newValue)}
                                            />
                                        </FillOpacityPickerContainer>
                                    </SecondFlexboxColumn>
                                </FlexboxContainer>

                                <FlexboxContainer>
                                    <FirstFlexboxColumn>
                                        <Field
                                            name="scaleMin"
                                            component={TextField}
                                            hintText="Scale minimum"
                                            floatingLabelText="Scale minimum"
                                            floatingLabelFixed={true}
                                            validate={[required]}
                                            fullWidth={true}
                                            type="number"
                                            min="0"
                                            autoComplete="off"
                                            onBlur={(event: any, newValue: string, previousValue: string) =>
                                                onFieldBlur(event.target.name, newValue, previousValue)}
                                        />
                                    </FirstFlexboxColumn>

                                    <SecondFlexboxColumn>
                                        <Field
                                            name="scaleMax"
                                            component={TextField}
                                            hintText="Scale maximum"
                                            floatingLabelText="Scale maximum"
                                            floatingLabelFixed={true}
                                            validate={[required]}
                                            fullWidth={true}
                                            type="number"
                                            min="0"
                                            autoComplete="off"
                                            onBlur={(event: any, newValue: string, previousValue: string) =>
                                                onFieldBlur(event.target.name, newValue, previousValue)}
                                        />
                                    </SecondFlexboxColumn>
                                </FlexboxContainer>

                                <LayerQuerySummary
                                    mapId={mapId}
                                    layerHash={layerHash}
                                    onFitScaleToData={onFitScaleToData}
                                />
                            </TabContainer>
                        </Tab>
                        {/* END VISUALISE TAB */}
                    </Tabs>

                    <HiddenButton type="submit" />
                </form>

                <Dialog
                    title="You have unsaved changes - what would you like to do?"
                    actions={[
                        <FlatButton label="Discard Changes" secondary={true} onTouchTap={onModalDiscardForm} />,
                        <FlatButton label="Save Changes" primary={true} onTouchTap={onModalSaveForm} />,
                    ]}
                    modal={true}
                    open={dirtyFormModalOpen}
                />
            </div>
        )
    }
}

// Decorate the form component
let LayerFormReduxForm = reduxForm(
    {
        form: "layerForm", // a unique name for this form
        enableReinitialize: true,
        onChange: (values: object, dispatch: Function, props: any) => {
            props.onFormChange(values, dispatch, props)
        },
    } as Config<any, any, any>
)(LayerForm)

export default LayerFormReduxForm
