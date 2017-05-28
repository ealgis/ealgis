import * as React from "react";
import { Link } from 'react-router';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import ContentCreate from 'material-ui/svg-icons/content/create';
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import DatasetSearch from "./DatasetSearchContainer";
import LayerQuerySummary from "./LayerQuerySummaryContainer";

import { Field, Fields, reduxForm } from 'redux-form';
import {
  SelectField,
  TextField,
  Checkbox,
  Slider,
} from 'redux-form-material-ui';
import ColourPicker from './FormControls/ColourPickerContainer';
import AlphaPicker from './FormControls/AlphaPickerContainer';

import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';

import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const required = value => value || value === 0 ? undefined : 'Required'

const styles = {
  tabBody: {
      margin: "10px",
  },
  hiddenSubmitButton: { 
      "display": "none", 
  },
  // FIXME What is the proper way to do CSS styling in JSX? -> ReactCSS
  flexboxContainer: {
    "display": "-ms-flex",
    "display": "-webkit-flex",
    "display": "flex",
    "justifyContent": "center",
    "alignItems": "center",
  },
  flexboxFirstColumn: {
    "flex": "1",
    "marginRight": "20px",
  },
  flexboxSecondColumn: {
    "flex": "1",
  },
  fauxFiedlLabel: {
      "fontSize": "12px",
      "color": "rgba(0, 0, 0, 0.3)",
      "marginBottom": "10px",
      "transform": "scale(1) translate(0px, -4px)",
      "transformOrigin": "left top 0px",
  },
  borderSizeSlider: {
    "marginBottom": "0px",
    "marginTop": "0px",
  },
  fillOpacityPicker: {
      "marginTop": "14px",
      "marginBottom": "10px",
  },
}

const FillColourSchemeFields = (fields: any) => {
    const colourSchemeLevels = (fields.colourinfo[fields["fillColourScheme"].input.value]) ? fields.colourinfo[fields["fillColourScheme"].input.value] : []

    return <div style={styles.flexboxContainer}>
                <div style={styles.flexboxFirstColumn}>
                    <Field
                        name="fillColourScheme"
                        component={SelectField}
                        hintText="Choose your colour scheme..."
                        floatingLabelText="Fill colour scheme"
                        floatingLabelFixed={true}
                        validate={[ required ]}
                        fullWidth={true}
                        onChange={
                            (junk: object, newValue: string, previousValue: string) => {
                                // There's two gotchas here:
                                // 1. redux-form-material-ui doesn't pass (event, newValue, previousValue) for SelectFields like it does for other field types. Hence the `junk` argument and repeating the field name.
                                // 2. We were (seemingly) seeing onChange firing before the application state had been updated with the new value for this SelectField. We'll work around this by using the debounced version.

                                const colourSchemeLevels = (fields.colourinfo[newValue]) ? fields.colourinfo[newValue] : []
                                const firstColourSchemeLevel = colourSchemeLevels[0]
                                const lastColourSchemeLevel = colourSchemeLevels.slice(-1)[0]

                                let fillColourSchemeLevel = fields["fillColourSchemeLevels"].input.value
                                if(fields["fillColourSchemeLevels"].input.value > lastColourSchemeLevel) {
                                    fillColourSchemeLevel = lastColourSchemeLevel
                                } else if(fields["fillColourSchemeLevels"].input.value < firstColourSchemeLevel) {
                                    fillColourSchemeLevel = firstColourSchemeLevel
                                }

                                fields.onFieldChange("fillColourScheme", {
                                    "fillColourScheme": newValue,
                                    "fillColourSchemeLevels": fillColourSchemeLevel
                                })
                            }
                        }
                    >
                    {
                        Object.keys(fields.colourinfo).map((colourLevel: any, key: any) =>
                            <MenuItem key={key} value={colourLevel} primaryText={colourLevel} />
                        )
                    }
                    </Field>
                </div>

                <div style={styles.flexboxSecondColumn}>
                    <Field 
                        name="fillColourSchemeLevels" 
                        component={SelectField} 
                        hintText="Choose the number of colour levels..."
                        floatingLabelText="Fill colour levels"
                        floatingLabelFixed={true}
                        fullWidth={true}
                        onChange={(junk: object, newValue: string, previousValue: string) => {
                            fields.onFieldChange("fillColourSchemeLevels", {
                                "fillColourScheme": fields["fillColourScheme"].input.value,
                                "fillColourSchemeLevels": newValue
                            })
                        }}
                    >
                    {
                        colourSchemeLevels.map((colourLevel: any, key: any) => 
                            <MenuItem key={key} value={colourLevel} primaryText={colourLevel} />
                        )
                    }
                    </Field>
                </div>
            </div>
}

export interface LayerFormProps {
    tabName: string,
    mapId: number,
    mapNameURLSafe: string,
    layerId: number,
    layerHash: string,
    initialValues: object,
    layerFillColourScheme: string,
    layerGeometry: object,
    onFormChange: Function,
    onSubmit: Function,
    onSubmitFail: Function,
    onFieldBlur: Function,
    onFieldChange: Function,
    onFitScaleToData: Function,
    onSaveForm: Function,
    onResetForm: Function,
    onModalSaveForm: Function,
    onModalDiscardForm: Function,
    dirtyFormModalOpen: boolean,
    isDirty: boolean,
    datainfo: object,
    colourinfo: object,
    layerFormSubmitting: boolean,
}

export class LayerForm extends React.Component<LayerFormProps, undefined> {
    geometryTables: Array<JSX.Element>
    colourSchemes: Array<JSX.Element>

    componentWillMount() {
        const { datainfo, colourinfo } = this.props

        this.geometryTables = []
        for(let geomtable_name in datainfo) {
            this.geometryTables.push(<MenuItem key={geomtable_name} value={JSON.stringify(datainfo[geomtable_name])} primaryText={datainfo[geomtable_name].description} />)
        }

        this.colourSchemes = []
        for(let colour in colourinfo) {
            this.colourSchemes.push(<MenuItem key={colour} value={colour} primaryText={colour} />)
        }
    }

    render() {
        const { error, handleSubmit, pristine, reset, submitting, change, initialValues } = this.props // from react-form
        const { mapId, mapNameURLSafe, layerId, layerHash, tabName, onSubmit, onFieldBlur, onFieldChange, colourinfo, layerFillColourScheme, onSaveForm, onResetForm, onModalSaveForm, onModalDiscardForm, dirtyFormModalOpen, onFitScaleToData, layerGeometry, layerFormSubmitting, isDirty } = this.props

        let tabId = 0
        switch(tabName) {
            case "data": tabId = 1; break;
            case "visualise": tabId = 2; break;
        }

        return <div>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton 
                        label={"Save"}
                        disabled={layerFormSubmitting || !isDirty}
                        primary={true}
                        onClick={onSaveForm}
                    />
                    <RaisedButton 
                        label={"Undo"}
                        disabled={layerFormSubmitting || !isDirty}
                        primary={true}
                        onClick={onResetForm}
                    />
                </ToolbarGroup>

                <ToolbarGroup lastChild={true}>
                    <IconButton tooltip="Close this layer and return to your map" tooltipPosition="bottom-right" containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}`} />}><NavigationClose /></IconButton>
                </ToolbarGroup>
            </Toolbar>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Tabs
                    initialSelectedIndex={tabId}
                >
                    {/* START DESCRIBE TAB */}
                    <Tab
                        icon={<ContentCreate />}
                        label="DESCRIBE"
                        containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}`}/>}
                    >
                        <div style={styles.tabBody}>
                            <Field 
                                name="name" 
                                component={TextField} 
                                hintText="Give your layer a name..."
                                floatingLabelText="Layer name"
                                floatingLabelFixed={true}
                                validate={[ required ]} 
                                fullWidth={true}
                                autoComplete="off"
                                onBlur={(event: any, newValue: string, previousValue: string) => onFieldBlur(event.target.name, newValue, previousValue)}
                            />

                            <Field 
                                name="description" 
                                component={TextField}
                                multiLine={true}
                                rows={2}
                                hintText="Give your layer a description..."
                                floatingLabelText="Layer description"
                                floatingLabelFixed={true}
                                validate={[ required ]}
                                fullWidth={true}
                                autoComplete="off"
                                onBlur={(event: any, newValue: string, previousValue: string) => onFieldBlur(event.target.name, newValue, previousValue)}
                            />
                            
                            <Field
                                name="geometry"
                                component={SelectField}
                                hintText="Choose your geometry..."
                                floatingLabelText="Geometry"
                                floatingLabelFixed={true}
                                validate={[ required ]} 
                                fullWidth={true}
                                onChange={(junk: object, newValue: object, previousValue: object) => onFieldChange("geometry", newValue)}
                            >
                                {this.geometryTables}
                            </Field>
                        </div>
                    </Tab>
                    {/* END DESCRIBE TAB */}

                    {/* START DATA TAB */}
                    <Tab
                        icon={<EditorInsertChart />}
                        label="DATA"
                        containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`}/>}
                    >
                        <div style={styles.tabBody}>
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
                                onBlur={(event: any, newValue: string, previousValue: string) => onFieldBlur(event.target.name, newValue, previousValue)}
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
                                onBlur={(event: any, newValue: string, previousValue: string) => onFieldBlur(event.target.name, newValue, previousValue)}
                            />

                            <DatasetSearch geometry={layerGeometry} />
                        </div>
                    </Tab>
                    {/* END DATA TAB */}

                    {/* START VISUALISE TAB */}
                    <Tab
                        icon={<ImagePalette />}
                        label="VISUALISE"
                        containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/visualise`}/>}
                    >
                        <div style={styles.tabBody}>
                            <div style={styles.flexboxContainer}>
                                <div style={styles.flexboxFirstColumn}>
                                    <h5 style={styles.fauxFiedlLabel}>Border colour</h5>
                                    <Field
                                        name="borderColour"
                                        component={ColourPicker}
                                        color={initialValues["borderColour"]}
                                        onChange={(junk: object, newValue: object, previousValue: object) => onFieldChange("borderColour", newValue)}
                                    />
                                </div>

                                <div style={styles.flexboxSecondColumn}>
                                    <h5 style={styles.fauxFiedlLabel}>Border size</h5>
                                    <Field 
                                        name="borderSize"
                                        component={Slider}
                                        validate={[ required ]}
                                        min={0}
                                        max={20}
                                        sliderStyle={styles.borderSizeSlider}
                                        step={1}
                                        onChange={(event: any, newValue: string, previousValue: string) => onFieldChange("borderSize", newValue)}
                                    />
                                </div>
                            </div>

                            <Fields 
                                names={["fillColourScheme", "fillColourSchemeLevels"]}
                                component={FillColourSchemeFields}
                                onFieldChange={onFieldChange}
                                colourinfo={colourinfo}
                            />

                            <div style={styles.flexboxContainer}>
                                <div style={styles.flexboxFirstColumn}>
                                    <Field
                                        name="fillColourScaleFlip"
                                        component={Checkbox}
                                        label={"Flip colours"}
                                        labelPosition={"left"}
                                        labelStyle={styles.fauxFiedlLabel}
                                        onChange={(event: any, newValue: string, previousValue: string) => onFieldChange("fillColourScaleFlip", newValue)}
                                    />
                                </div>

                                <div style={styles.flexboxSecondColumn}>
                                    <h5 style={styles.fauxFiedlLabel}>Fill opacity</h5>
                                    <div style={styles.fillOpacityPicker}>
                                        <Field
                                            name="fillOpacity"
                                            component={AlphaPicker}
                                            rgb={{"r": 0, "g": 0, "b": 0, "a": initialValues["fillOpacity"]}}
                                            onChange={(event: any, newValue: object, previousValue: object) => onFieldChange("fillOpacity", newValue)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.flexboxContainer}>
                                <div style={styles.flexboxFirstColumn}>
                                    <Field 
                                        name="scaleMin" 
                                        component={TextField} 
                                        hintText="Scale minimum"
                                        floatingLabelText="Scale minimum"
                                        floatingLabelFixed={true}
                                        validate={[ required ]}
                                        fullWidth={true}
                                        type="number"
                                        min="0"
                                        autoComplete="off"
                                        onBlur={(event: any, newValue: string, previousValue: string) => onFieldBlur(event.target.name, newValue, previousValue)}
                                    />
                                </div>

                                <div style={styles.flexboxSecondColumn}>
                                    <Field 
                                        name="scaleMax" 
                                        component={TextField} 
                                        hintText="Scale maximum"
                                        floatingLabelText="Scale maximum"
                                        floatingLabelFixed={true}
                                        validate={[ required ]}
                                        fullWidth={true}
                                        type="number"
                                        min="0"
                                        autoComplete="off"
                                        onBlur={(event: any, newValue: string, previousValue: string) => onFieldBlur(event.target.name, newValue, previousValue)}
                                    />
                                </div>
                            </div>

                            <LayerQuerySummary mapId={mapId} layerHash={layerHash} onFitScaleToData={onFitScaleToData} />
                        </div>
                    </Tab>
                    {/* END VISUALISE TAB */}
                </Tabs>

                <button type="submit" style={styles.hiddenSubmitButton} /> 
            </form>

            <Dialog
                title="You have unsaved changes - what would you like to do?"
                actions={[
                    <FlatButton
                        label="Discard Changes"
                        secondary={true}
                        onTouchTap={onModalDiscardForm}
                    />,
                    <FlatButton
                        label="Save Changes"
                        primary={true}
                        onTouchTap={onModalSaveForm}
                    />,
                ]}
                modal={true}
                open={dirtyFormModalOpen}
            />
        </div>
    }
}

// Decorate the form component
let LayerForm = reduxForm({
  form: 'layerForm', // a unique name for this form
  enableReinitialize: true,
  onChange: (values: object, dispatch: Function, props: object) => {
      props.onFormChange(values, dispatch, props)
  },
})(LayerForm)

export default LayerForm
