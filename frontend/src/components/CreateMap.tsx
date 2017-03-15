import * as React from "react";
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import { Field, reduxForm } from 'redux-form';
import { TextField } from 'redux-form-material-ui';

import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {red500} from 'material-ui/styles/colors';

const required = value => value ? undefined : 'Required'

export interface CreateMapProps {
    onSubmit: Function,
}

export class CreateMap extends React.Component<CreateMapProps, undefined> {
    render() {
        const { error, handleSubmit, pristine, reset, submitting, onSubmit } = this.props // from react-form

        return <div>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton 
                        label="Create Map" 
                        disabled={submitting}
                        primary={true}
                        onClick={handleSubmit(onSubmit)}
                    />
                </ToolbarGroup>

                <ToolbarGroup lastChild={true}>
                    <IconButton tooltip="Close this map and return to your list of maps" tooltipPosition="bottom-right" containerElement={<Link to={`/`} />}><NavigationClose /></IconButton>
                </ToolbarGroup>
            </Toolbar>

            <form style={{margin: 10}} onSubmit={(val) => handleSubmit(onSubmit)}>
                <Field 
                    name="name" 
                    component={TextField}
                    hintText="Give your map a name..."
                    floatingLabelText="Map name"
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
                    hintText="Give your map a description..."
                    floatingLabelText="Map description"
                    floatingLabelFixed={true}
                    validate={[ required ]}
                    fullWidth={true}
                    autoComplete="off"
                />

                {error && <strong style={{"fontSize": "12px", "color": red500, "marginTop": "40px"}}>{error}</strong>}

                {/*<RaisedButton 
                    label="Create Map" 
                    primary={true}
                    style={{marginTop: 20, marginLeft: "1%"}}
                    containerElement={<Link to={`/`} />}
                    onClick={this.handleSubmit}
                />*/}
            </form>
        </div>
    }
}

// Decorate the form component
export default reduxForm({
  form: 'createMap', // a unique name for this form
})(CreateMap),