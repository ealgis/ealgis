import * as React from "react";
import { Link } from 'react-router';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import { Field, reduxForm } from 'redux-form';
import {
  SelectField,
  TextField,
  Toggle,
} from 'redux-form-material-ui';
import ColourPicker from './FormControls/ColourPickerContainer';

import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';

import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import { red500, grey400 } from 'material-ui/styles/colors';

const required = value => value || value === 0 ? undefined : 'Required'

export interface CreateMapProps {
    mapId: number,
    layerId: number,
    initialValues: object,
    onSubmit: Function,
    datainfo: object,
    colourinfo: object,
}

export class CreateMap extends React.Component<CreateMapProps, undefined> {
    geometryTables: Array<JSX.Element>
    colourSchemes: Array<JSX.Element>

    componentWillMount() {
        const { datainfo, colourinfo } = this.props

        this.geometryTables = []
        for(let geomtable_name in datainfo) {
            this.geometryTables.push(<MenuItem key={geomtable_name} value={datainfo[geomtable_name]} primaryText={datainfo[geomtable_name].description} />)
        }

        this.colourSchemes = []
        for(let colour in colourinfo) {
            this.colourSchemes.push(<MenuItem key={colour} value={colour} primaryText={colour} />)
        }
    }

    render() {
        const { error, handleSubmit, pristine, reset, submitting, change, initialValues } = this.props // from react-form
        const { mapId, layerId, onSubmit } = this.props

        // FIXME See OneTab for a bunch of saved links about how to express dependencies between fields in redux-form

        // Make sure that the Colour Scheme Level resets when we change our
        // colour scheme.
        const normalizeColourSchemes = (value, previousValue, allValues, previousAllValues) => {
            const coloursLevels = colourinfo[value]
            if(allValues["fillColourSchemeLevels"] > coloursLevels[coloursLevels.length - 1]) {
                change("fillColourSchemeLevels", coloursLevels[coloursLevels.length - 1])
            } else if(allValues["fillColourSchemeLevels"] < coloursLevels[0]) {
                change("fillColourSchemeLevels", coloursLevels[0])
            }

            return value
        }

        // Make sure the Colour Scheme Levels are within the bounds of the currently
        // selected scheme.
        const normalizeColourSchemeLevels = (value, previousValue, allValues, previousAllValues) => {
            const currentLevel = parseInt(value)
            const coloursLevels = colourinfo[allValues["fillColourScheme"]]
            
            if(coloursLevels.includes(currentLevel)) {
                return value
            } else if(currentLevel > coloursLevels[coloursLevels.length - 1]) {
                return coloursLevels[coloursLevels.length - 1]
            }
            return coloursLevels[0]
        }

        return <div>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton 
                        label={layerId === undefined ? "Create Layer" : "Save Layer"}
                        disabled={submitting}
                        primary={true}
                        onClick={handleSubmit(onSubmit)}
                    />
                </ToolbarGroup>

                <ToolbarGroup lastChild={true}>
                    <IconButton tooltip="Close this layer and return to your map" tooltipPosition="bottom-right" containerElement={<Link to={`/map/${mapId}`} />}><NavigationClose /></IconButton>
                </ToolbarGroup>
            </Toolbar>

            <form style={{margin: 10}} onSubmit={(val) => handleSubmit(onSubmit)}>
                <Field 
                    name="name" 
                    component={TextField} 
                    hintText="Give your layer a name..."
                    floatingLabelText="Layer name"
                    floatingLabelFixed={true}
                    validate={[ required ]} 
                    fullWidth={true}
                    autoComplete="off"
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
                />
                
                <Field
                    name="geometry"
                    component={SelectField}
                    hintText="Choose your geometry..."
                    floatingLabelText="Geometry"
                    floatingLabelFixed={true}
                    validate={[ required ]} 
                    fullWidth={true}
                >
                    {this.geometryTables}
                </Field>

                <Field 
                    name="borderSize" 
                    component={TextField} 
                    hintText="Border size (pixels)"
                    floatingLabelText="Border size"
                    floatingLabelFixed={true}
                    validate={[ required ]}
                    fullWidth={true}
                    type="number"
                    min="0"
                    max="20"
                />

                <h5 style={{"fontSize": "12px", "color": grey400}}>Border colour</h5>
                <Field
                    name="borderColour"
                    component={ColourPicker}
                    color={initialValues["borderColour"]}
                />

                <div style={{"display": "flex", "width": "100%", "marginBottom": 10, "marginTop": 10}}>
                    <div style={{"flex": 1, "flexBasis": "auto"}}>
                        <Field
                            name="fillColourScheme"
                            component={SelectField}
                            hintText="Choose your colour scheme..."
                            floatingLabelText="Fill colour scheme"
                            floatingLabelFixed={true}
                            fullWidth={true}
                            normalize={normalizeColourSchemes}
                        >
                            {this.colourSchemes}
                        </Field>
                    </div>

                    <div style={{"flex": 1, "flexBasis": "auto"}}>
                        <h5 style={{"fontSize": "12px", "color": grey400, "marginLeft": "45%"}}>Flip colours</h5>
                        <Field
                            name="fillColourScaleFlip"
                            component={Toggle}
                            style={{"marginLeft": "45%"}}
                        />
                    </div>
                </div>

                <Field 
                    name="fillColourSchemeLevels" 
                    component={TextField} 
                    hintText="Choose the number of colour levels..."
                    floatingLabelText="Fill colour levels"
                    floatingLabelFixed={true}
                    validate={[ required ]}
                    fullWidth={true}
                    type="number"
                    normalize={normalizeColourSchemeLevels}
                />

                <Field 
                    name="fillOpacity" 
                    component={TextField} 
                    hintText="Fill opacity (%)"
                    floatingLabelText="Fill opacity"
                    floatingLabelFixed={true}
                    validate={[ required ]}
                    fullWidth={true}
                    type="number"
                    min="0"
                    max="100"
                />

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
                />

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
                    max="100"
                />

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
                    max="100"
                />
            </form>
        </div>
    }
}

// Decorate the form component
let LayerForm reduxForm({
  form: 'layerForm', // a unique name for this form
  enableReinitialize: true,
})(CreateMap)

export default LayerForm
