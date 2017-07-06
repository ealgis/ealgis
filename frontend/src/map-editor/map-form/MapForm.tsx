import * as React from "react"
import styled from "styled-components"
import { IMap } from "../../redux/modules/interfaces"

import { Link } from "react-router"
import RaisedButton from "material-ui/RaisedButton"
import NavigationClose from "material-ui/svg-icons/navigation/close"

import { Field, reduxForm } from "redux-form"
import { TextField } from "redux-form-material-ui"

import IconButton from "material-ui/IconButton"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import { red500 } from "material-ui/styles/colors"

const required = (value: any) => (value ? undefined : "Required")

const Form = styled.form`margin: 10px;`

const FormErrorMessage = styled.span`
    font-weight: bold;
    font-size: 12px;
    color: ${red500};
    margin-top: 40px;
`

const HiddenButton = styled.button`display: none;`

export interface IProps {
    mapDefinition: IMap
    initialValues: any
    onSubmit: Function
}

export class MapForm extends React.Component<IProps, {}> {
    render() {
        const { error, handleSubmit, pristine, reset, submitting, onSubmit, initialValues }: any = this.props // from react-form
        const { mapDefinition } = this.props

        let closeLink =
            mapDefinition === undefined
                ? <Link to={`/`} />
                : <Link to={`/map/${mapDefinition.id}/${mapDefinition["name-url-safe"]}`} />

        return (
            <div>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <RaisedButton
                            label={mapDefinition === undefined ? "Create Map" : "Save Map"}
                            disabled={submitting}
                            primary={true}
                            onClick={handleSubmit(onSubmit)}
                        />
                    </ToolbarGroup>

                    <ToolbarGroup lastChild={true}>
                        <IconButton
                            tooltip="Close this map and return to your list of maps"
                            tooltipPosition="bottom-right"
                            containerElement={closeLink}
                        >
                            <NavigationClose />
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Field
                        name="name"
                        component={TextField}
                        hintText="Give your map a name..."
                        floatingLabelText="Map name"
                        floatingLabelFixed={true}
                        validate={[required]}
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
                        validate={[required]}
                        fullWidth={true}
                        autoComplete="off"
                    />

                    {error &&
                        <FormErrorMessage>
                            {error}
                        </FormErrorMessage>}

                    <HiddenButton type="submit" />
                </Form>
            </div>
        )
    }
}

// Decorate the form component
export default reduxForm({
    form: "mapForm", // a unique name for this form
})(MapForm)
