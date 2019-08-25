import IconButton from "material-ui/IconButton";
import RaisedButton from "material-ui/RaisedButton";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import { red500, white } from "material-ui/styles/colors";
import NavigationClose from "material-ui/svg-icons/navigation/close";
import * as React from "react";
import { Link } from "react-router";
import { Field, reduxForm } from "redux-form";
import { TextField } from "redux-form-material-ui";
import styled from "styled-components";
import { IMap } from "../../redux/modules/maps";

// Silence TS2322 "Types of property 'component' are incompatible" errors
class MyField extends Field<any> {}

const required = (value: any) => (value ? undefined : "Required")

const Form = styled.form`
    margin: 10px;
`

const FormErrorMessage = styled.span`
    font-weight: bold;
    font-size: 12px;
    color: ${red500};
    margin-top: 40px;
`

const HiddenButton = styled.button`
    display: none;
`

export interface IProps {
    mapDefinition: IMap
    initialValues: any
    onSubmit: Function
}

export class MapForm extends React.Component<IProps, {}> {
    render() {
        const { error, handleSubmit, submitting, onSubmit }: any = this.props // from react-form
        const { mapDefinition } = this.props

        let closeLink =
            mapDefinition === undefined ? <Link to={`/maps`} /> : <Link to={`/map/${mapDefinition.id}/${mapDefinition["name-url-safe"]}`} />

        return (
            <React.Fragment>
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
                            <NavigationClose color={white} />
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <MyField
                        name="name"
                        component={TextField}
                        hintText="Give your map a name..."
                        floatingLabelText="Map name"
                        floatingLabelFixed={true}
                        validate={[required]}
                        fullWidth={true}
                        autoComplete="off"
                    />

                    <MyField
                        name="description"
                        component={TextField}
                        multiLine={true}
                        rows={2}
                        hintText="Give your map a description..."
                        floatingLabelText="Map description"
                        floatingLabelFixed={true}
                        fullWidth={true}
                        autoComplete="off"
                    />

                    {error && <FormErrorMessage>{error}</FormErrorMessage>}

                    <HiddenButton type="submit" />
                </Form>
            </React.Fragment>
        )
    }
}

// Decorate the form component
export default reduxForm({
    form: "mapForm", // a unique name for this form
// @ts-ignore
})(MapForm)
