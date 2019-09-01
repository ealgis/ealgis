import { groupBy } from "lodash-es"
import Divider from "material-ui/Divider"
import IconButton from "material-ui/IconButton"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"
import Subheader from "material-ui/Subheader"
import { ActionCheckCircle, AvPlaylistAddCheck, ContentUndo } from "material-ui/svg-icons"
import { Tab, Tabs } from "material-ui/Tabs"
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar"
import * as React from "react"
import { Link } from "react-router"
import { Field, Fields, reduxForm } from "redux-form"
import { Checkbox, SelectField, Slider, TextField } from "redux-form-material-ui"
import styled from "styled-components"
import FilterExpressionContainer from "../../expression-editor/filter-expression-editor/FilterExpressionEditorContainer"
import ValueExpressionContainer from "../../expression-editor/value-expression-editor/ValueExpressionEditorContainer"
import { IColourInfo, IGeomInfo, IGeomTable } from "../../redux/modules/ealgis"
import { IMUIThemePalette } from "../../redux/modules/interfaces"
import { eLayerTypeOfData } from "../../redux/modules/maps"
import AlphaPicker from "../../shared/ui/alpha-picker/AlphaPickerContainer"
import ColourPicker from "../../shared/ui/colour-picker/ColourPickerContainer"
import { capitaliseFirstLetter } from "../../shared/utils"
import ColourScaleBarContainer from "../color-scale-bar/ColourScaleBarContainer"
import LayerQuerySummaryContainer from "../layer-query-summary/LayerQuerySummaryContainer"
import { eVisibleComponent } from "./LayerFormContainer"

// Silence TS2322 "Types of property 'component' are incompatible" errors
class MyField extends Field<any> {}

// Silence "TS2339: Property 'onClick' does not exist'" warnings
class ClickableIconButton extends React.Component<any, any> {
    render() {
        return <IconButton {...this.props} />
    }
}

const required = (value: any) => (value || value === 0 ? undefined : "Required")

const MasterFlexboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`

const MasterFlexboxItem = styled.div`
    padding-bottom: 56px; /* Height of MasterFlexboxItemBottomFixed */
`

const MasterFlexboxItemBottomFixed = styled.div`
    position: absolute;
    bottom: 0;
    width: 24em;
    z-index: 1;
`

const MyRaisedButton = styled(RaisedButton)`
    margin: 12px;
`

const TabContainer = styled.div`
    margin: 10px;
`

const HiddenButton = styled.button`
    display: none;
`

const FormSectionSubheader = styled(Subheader)`
    line-height: 30px !important;
    padding-top: 16px;
`

const FormSectionSubheaderMini = styled(Subheader)`
    line-height: 30px !important;
    padding-top: 16px;
    padding-left: 6px !important;
`

const PaddedDivider = styled(Divider)`
    margin-top: 12px !important;
`

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
    font-size: 12px;
`

const SecondFlexboxColumn = styled.div`
    flex: 1;
`

const FauxFieldLabelDescriptionHeading = styled.h4`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.3);
    margin-bottom: 10px;
    transform: scale(1) translate(0px, -4px);
    transform-origin: left top 0px;
`

const ColourSelectField = styled(SelectField)`
    /* Sorry */
    & > div:nth-child(2) > div > div:nth-child(2) {
        height: auto !important;
    }
`

const HelpText = styled.div`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.5);
    margin-bottom: 10px;
`

const styles: any = {
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
        <React.Fragment>
            <FlexboxContainer>
                <FirstFlexboxColumn>
                    <FauxFieldLabelDescriptionHeading>Colour</FauxFieldLabelDescriptionHeading>
                    Choose the outline colour of your data.
                </FirstFlexboxColumn>

                <SecondFlexboxColumn>
                    <MyField
                        name="borderColour"
                        component={ColourPicker}
                        color={fields.initialBorderColour}
                        onChange={
                            (junk: object, newValue: object, previousValue: object) => fields.onFieldChange("borderColour", newValue)
                            // fields.onFieldChange("borderColour", {
                            //     borderColour: newValue,
                            //     borderSize: fields["borderSize"].input.value,
                            // })
                        }
                    />
                </SecondFlexboxColumn>
            </FlexboxContainer>

            <PaddedDivider />

            <FlexboxContainer>
                <FirstFlexboxColumn>
                    <FauxFieldLabelDescriptionHeading>Size</FauxFieldLabelDescriptionHeading>
                    Choose the width of your outline borders.
                </FirstFlexboxColumn>

                <SecondFlexboxColumn>
                    <MyField
                        name="borderSize"
                        component={Slider}
                        validate={[required]}
                        min={0}
                        max={10}
                        sliderStyle={styles.borderSizeSlider}
                        step={1}
                        onChange={
                            (event: any, newValue: string, previousValue: string) => fields.onFieldChange("borderSize", newValue)
                            // fields.onFieldChange("borderSize", {
                            //     borderColour: fields["borderColour"],
                            //     borderSize: newValue,
                            // })
                        }
                    />
                </SecondFlexboxColumn>
            </FlexboxContainer>

            <PaddedDivider />
        </React.Fragment>
    )
}

const StylingFields = (fields: any) => {
    const colourSchemeLevels = fields.colourinfo[fields["fillColourScheme"].input.value]
        ? fields.colourinfo[fields["fillColourScheme"].input.value]
        : []
    const getColourSchemeLevelWithinRange = (colourLevel: string) => {
        const colourSchemeLevels = fields.colourinfo[colourLevel]
        const firstColourSchemeLevel = colourSchemeLevels[0]
        const lastColourSchemeLevel = colourSchemeLevels.slice(-1)[0]

        let fillColourSchemeLevel = fields["fillColourSchemeLevels"].input.value
        if (fields["fillColourSchemeLevels"].input.value > lastColourSchemeLevel) {
            fillColourSchemeLevel = lastColourSchemeLevel
        } else if (fields["fillColourSchemeLevels"].input.value < firstColourSchemeLevel) {
            fillColourSchemeLevel = firstColourSchemeLevel
        }
        return fillColourSchemeLevel
    }

    return (
        <React.Fragment>
            {fields["doFill"] && (
                <React.Fragment>
                    <FormSectionSubheader>Colours</FormSectionSubheader>
                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <FauxFieldLabelDescriptionHeading>Colour scheme</FauxFieldLabelDescriptionHeading>
                            Choose a colour scheme for your data.
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <MyField
                                name="fillColourScheme"
                                component={ColourSelectField}
                                // hintText="Choose your colour scheme..."
                                // floatingLabelText="Fill colour scheme"
                                // floatingLabelFixed={true}
                                validate={[required]}
                                fullWidth={true}
                                // onChange={(junk: object, newValue: object, previousValue: object) =>
                                //     fields.onFieldChange("fillColourScheme", newValue)
                                // }
                                onChange={(junk: object, newValue: string, previousValue: string) => {
                                    // There's two gotchas here:
                                    // 1. redux-form-material-ui doesn't pass (event, newValue, previousValue) for SelectFields like it does for other field types. Hence the `junk` argument and repeating the field name.
                                    // 2. We were (seemingly) seeing onChange firing before the application state had been updated with the new value for this SelectField. We'll work around this by using the debounced version.

                                    fields.onFieldChange("fillColourScheme", {
                                        fillColourScheme: newValue,
                                        fillColourSchemeLevels: getColourSchemeLevelWithinRange(newValue),
                                    })
                                }}
                                selectionRenderer={(colourLevel: string) => {
                                    return (
                                        <ColourScaleBarContainer
                                            colourName={colourLevel}
                                            colourLevel={getColourSchemeLevelWithinRange(colourLevel)}
                                            scaleMin={parseFloat(fields["scaleMin"].input.value)}
                                            scaleMax={parseFloat(fields["scaleMax"].input.value)}
                                            scaleFlip={fields["fillColourScaleFlip"].input.value}
                                            opacity={fields["fillOpacity"].input.value}
                                        />
                                    )
                                }}
                            >
                                {Object.keys(fields.colourinfo).map((colourLevel: any, key: any) => (
                                    <MenuItem key={key} value={colourLevel} style={{ paddingBottom: 10 }}>
                                        <ColourScaleBarContainer
                                            colourName={colourLevel}
                                            colourLevel={getColourSchemeLevelWithinRange(colourLevel)}
                                            scaleMin={parseFloat(fields["scaleMin"].input.value)}
                                            scaleMax={parseFloat(fields["scaleMax"].input.value)}
                                            scaleFlip={fields["fillColourScaleFlip"].input.value}
                                            opacity={fields["fillOpacity"].input.value}
                                        />
                                    </MenuItem>
                                ))}
                            </MyField>
                        </SecondFlexboxColumn>
                    </FlexboxContainer>

                    <PaddedDivider />

                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <FauxFieldLabelDescriptionHeading>Colour categories</FauxFieldLabelDescriptionHeading>
                            Choose how many colour categories you want.
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <MyField
                                name="fillColourSchemeLevels"
                                component={SelectField}
                                // hintText="Choose the number of colour levels..."
                                // floatingLabelText="Fill colour levels"
                                // floatingLabelFixed={true}
                                fullWidth={true}
                                onChange={(junk: object, newValue: object, previousValue: object) =>
                                    fields.onFieldChange("fillColourSchemeLevels", newValue)
                                }
                                // onChange={(junk: object, newValue: string, previousValue: string) => {
                                //     fields.onFieldChange("fillColourSchemeLevels", {
                                //         fillColourScheme: fields["fillColourScheme"].input.value,
                                //         fillColourSchemeLevels: newValue,
                                //     })
                                // }}
                            >
                                {colourSchemeLevels.map((colourLevel: any, key: any) => (
                                    <MenuItem key={key} value={colourLevel} primaryText={colourLevel} />
                                ))}
                            </MyField>
                        </SecondFlexboxColumn>
                    </FlexboxContainer>

                    <PaddedDivider />

                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <FauxFieldLabelDescriptionHeading>Flip colours</FauxFieldLabelDescriptionHeading>
                            Invert the colours used by your chosen colour scheme.
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <MyField
                                name="fillColourScaleFlip"
                                component={Checkbox}
                                // label={"Flip colours"}
                                // labelPosition={"left"}
                                // labelStyle={styles.fauxFiedlLabel}
                                onChange={(event: any, newValue: string, previousValue: string) =>
                                    fields.onFieldChange("fillColourScaleFlip", newValue)
                                }
                            />
                        </SecondFlexboxColumn>
                    </FlexboxContainer>

                    <PaddedDivider />

                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <FauxFieldLabelDescriptionHeading>Transparency</FauxFieldLabelDescriptionHeading>
                            Choose the level of transparency your colours should have.
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <MyField
                                name="fillOpacity"
                                component={AlphaPicker}
                                rgb={{ r: 0, g: 0, b: 0, a: fields.initialValues["fillOpacity"] }}
                                onChange={(event: any, newValue: object, previousValue: object) =>
                                    fields.onFieldChange("fillOpacity", newValue)
                                }
                            />
                        </SecondFlexboxColumn>
                    </FlexboxContainer>

                    <PaddedDivider />
                </React.Fragment>
            )}

            <FormSectionSubheader>Outline</FormSectionSubheader>
            <Fields
                names={["borderColour", "borderSize"]}
                component={BorderSizeAndColourFields}
                onFieldChange={fields.onFieldChange}
                initialBorderColour={fields.initialValues["borderColour"]}
            />

            {fields["isPointGeom"] && (
                <React.Fragment>
                    <FormSectionSubheader>Points</FormSectionSubheader>
                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <FauxFieldLabelDescriptionHeading>Radius</FauxFieldLabelDescriptionHeading>
                            Choose the symbol radius for your point data.
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <MyField
                                name="pointRadius"
                                component={TextField}
                                validate={[required]}
                                fullWidth={true}
                                type="number"
                                min="0"
                                autoComplete="off"
                                onChange={(event: any, newValue: string, previousValue: string) =>
                                    fields.onFieldChange(event.target.name, parseFloat(newValue), parseFloat(previousValue))
                                }
                            />
                        </SecondFlexboxColumn>
                    </FlexboxContainer>
                </React.Fragment>
            )}

            {fields["doFill"] && (
                <React.Fragment>
                    <FormSectionSubheader>Scaling</FormSectionSubheader>

                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <FauxFieldLabelDescriptionHeading>Scale minimum</FauxFieldLabelDescriptionHeading>
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <MyField
                                name="scaleMin"
                                component={TextField}
                                // hintText="Scale minimum"
                                // floatingLabelText="Scale minimum"
                                // floatingLabelFixed={true}
                                validate={[required]}
                                fullWidth={true}
                                type="number"
                                min="0"
                                autoComplete="off"
                                onBlur={(event: any, newValue: string, previousValue: string) =>
                                    fields.onFieldBlur(event.target.name, parseFloat(newValue), parseFloat(previousValue))
                                }
                            />
                        </SecondFlexboxColumn>
                    </FlexboxContainer>

                    <PaddedDivider />

                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <FauxFieldLabelDescriptionHeading>Scale maximum</FauxFieldLabelDescriptionHeading>
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>
                            <MyField
                                name="scaleMax"
                                component={TextField}
                                // hintText="Scale maximum"
                                // floatingLabelText="Scale maximum"
                                // floatingLabelFixed={true}
                                validate={[required]}
                                fullWidth={true}
                                type="number"
                                min="0"
                                autoComplete="off"
                                onBlur={(event: any, newValue: string, previousValue: string) =>
                                    fields.onFieldBlur(event.target.name, parseFloat(newValue), parseFloat(previousValue))
                                }
                            />
                        </SecondFlexboxColumn>
                    </FlexboxContainer>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}

const GeometryAndDataFields = (fields: any) => {
    return (
        <React.Fragment>
            <FormSectionSubheaderMini>1. Choose a level of detail</FormSectionSubheaderMini>
            <MyField
                name="geometry"
                component={SelectField}
                // hintText="Choose your level of detail..."
                // floatingLabelText="Level of detail"
                // floatingLabelFixed={true}
                validate={[required]}
                fullWidth={true}
                autoWidth={true}
                onChange={(junk: object, newValue: object, previousValue: object) => fields.onFieldChange("geometry", newValue)}
                selectionRenderer={fields.geometrySelectionRenderer}
            >
                {fields.geometryTables}
            </MyField>
            <FormSectionSubheaderMini>2. Choose the data to map</FormSectionSubheaderMini>
            <MyField
                name="valueExpression"
                component={TextField}
                disabled={true}
                multiLine={true}
                rows={2}
                // hintText="Write an expression..."
                // floatingLabelText="Value expression"
                // floatingLabelFixed={true}
                fullWidth={true}
                autoComplete="off"
                onBlur={(event: any, newValue: string, previousValue: string) =>
                    fields.onFieldBlur(event.target.name, newValue, previousValue)
                }
            />
            <RaisedButton
                containerElement={<Link to={`${fields.layerURLBase}/data/value-expression`} />}
                label={"Choose Data"}
                primary={true}
                disabled={fields["geometry"].input.value === ""}
                style={{ width: "100%", marginTop: "15px", marginBottom: "10px" }}
            />

            <FormSectionSubheaderMini>3. What type of data is this?</FormSectionSubheaderMini>
            <MyField
                name="type_of_data"
                component={SelectField}
                validate={[required]}
                fullWidth={true}
                onChange={(junk: object, newValue: object, previousValue: object) => fields.onFieldChange("type_of_data", newValue)}
            >
                {Object.values(eLayerTypeOfData).map((value: string) => (
                    <MenuItem key={value} value={value} primaryText={capitaliseFirstLetter(value)} />
                ))}
            </MyField>
            <HelpText>
                <strong>Continuous data</strong> is data that is measuring something (e.g. the speed of a train or the percentage of people
                in an area who are volunteers).
                <br />
                <br />
                <strong>Discrete data</strong> is data that counts things (e.g. the number of languages spoken or the number of people in a
                family) or data about categories of things (e.g. short, normal, tall).
                <br />
                <br />
                If you're not sure, choose continuous and see if it's appropriate for your data when you style it in the next step.
            </HelpText>

            <FormSectionSubheaderMini>4. Filter the data</FormSectionSubheaderMini>
            <MyField
                name="filterExpression"
                component={TextField}
                disabled={true}
                multiLine={true}
                rows={2}
                hintText="Optionally apply a filter to your data"
                // floatingLabelText="Filter expression"
                // floatingLabelFixed={true}
                fullWidth={true}
                autoComplete="off"
                onBlur={(event: any, newValue: string, previousValue: string) =>
                    fields.onFieldBlur(event.target.name, newValue, previousValue)
                }
            />
            <RaisedButton
                containerElement={<Link to={`${fields.layerURLBase}/data/filter-expression`} />}
                label={"Apply a Filter"}
                primary={true}
                disabled={fields["geometry"].input.value === ""}
                style={{ width: "100%", marginTop: "15px", marginBottom: "10px" }}
            />
        </React.Fragment>
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
    doFill: boolean
    isPointGeom: boolean
    visibleComponent: eVisibleComponent
    dirtyFormModalOpen: boolean
    isDirty: boolean
    onRemoveColumn: Function
    onApplyValueExpression: Function
    onApplyFilterExpression: Function
    onCloseExpressionEditor: Function
    onCloseLayer: Function
    geominfo: IGeomInfo
    colourinfo: IColourInfo
    layerFormSubmitting: boolean
    initialValues: object
    onSubmitFail: Function
    onFieldBlur: Function
    onFieldChange: Function
    onFormChange: Function
    onFitScaleToData: Function
    onFormComplete: any
    onResetForm: any
}

class LayerForm extends React.Component<IProps, {}> {
    geometryTables!: Array<JSX.Element>

    geometrySelectionRenderer = (geom_table_json: string) => {
        const geom_table: IGeomTable = JSON.parse(geom_table_json)
        return `${geom_table.description} (${geom_table.schema_title})`
    }

    componentWillMount() {
        const { geominfo } = this.props

        this.geometryTables = []
        const grouped = groupBy(geominfo, (geom: any) => geom.schema_title)

        Object.keys(grouped).forEach((schema_title: string) => {
            this.geometryTables.push(<Subheader key={schema_title}>{schema_title}</Subheader>)

            grouped[schema_title].forEach((geom_table: IGeomTable) => {
                this.geometryTables.push(
                    <MenuItem
                        key={`${geom_table.schema_name}.${geom_table.name}`}
                        value={JSON.stringify(geom_table)}
                        primaryText={geom_table.description}
                    />
                )
            })
        })
    }

    render() {
        const { initialValues }: any = this.props // from react-form
        const {
            muiThemePalette,
            mapId,
            mapNameURLSafe,
            layerId,
            layerHash,
            tabName,
            onFieldBlur,
            onFieldChange,
            colourinfo,
            doFill,
            isPointGeom,
            visibleComponent,
            onFormComplete,
            onResetForm,
            onFitScaleToData,
            isDirty,
            onApplyValueExpression,
            onApplyFilterExpression,
            onCloseExpressionEditor,
        } = this.props

        let tabId = 0
        switch (tabName) {
            case "name":
                tabId = 0
                break
            case "data":
                tabId = 1
                break
            case "style":
                tabId = 2
                break
        }

        // For chip input-based expression editors (if needed)
        // const selectedColumnChipValues = selectedColumns.map((column: IColumn) => {
        //     return {
        //       text: column["name"],
        //       value: (
        //         <MenuItem key={column["name"]}
        //           primaryText={
        //             <StyledMenuItemPrimaryText>
        //               {`${column["metadata_json"]["type"]} // ${column["metadata_json"]["kind"]}`.substr(0, 30)}
        //             </StyledMenuItemPrimaryText>
        //           }
        //           secondaryText={column["name"].toUpperCase()}
        //         />
        //       )
        //     }
        //   })

        return (
            <MasterFlexboxContainer>
                <MasterFlexboxItem>
                    <form onSubmit={(e: any) => e.preventDefault()}>
                        <Tabs value={tabId}>
                            {/* START DETAILS TAB */}
                            <Tab
                                value={0}
                                label="DETAILS"
                                containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/name`} />}
                            >
                                <TabContainer>
                                    <MyField
                                        name="name"
                                        component={TextField}
                                        hintText="Give your layer a name..."
                                        floatingLabelText="Layer name"
                                        floatingLabelFixed={true}
                                        validate={[required]}
                                        fullWidth={true}
                                        autoComplete="off"
                                        onBlur={(event: any, newValue: string, previousValue: string) =>
                                            onFieldBlur(event.target.name, newValue, previousValue)
                                        }
                                    />

                                    <MyField
                                        name="description"
                                        component={TextField}
                                        multiLine={true}
                                        rows={2}
                                        hintText="Give your layer a description..."
                                        floatingLabelText="Layer description"
                                        floatingLabelFixed={true}
                                        fullWidth={true}
                                        autoComplete="off"
                                        onBlur={(event: any, newValue: string, previousValue: string) =>
                                            onFieldBlur(event.target.name, newValue, previousValue)
                                        }
                                    />
                                </TabContainer>
                            </Tab>
                            {/* END DETAILS TAB */}

                            {/* START DATA TAB */}
                            <Tab
                                value={1}
                                label="DATA"
                                containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                            >
                                <TabContainer>
                                    {visibleComponent === eVisibleComponent.LAYER_FORM && (
                                        <React.Fragment>
                                            <Fields
                                                names={["geometry", "valueExpression", "filterExpression"]}
                                                component={GeometryAndDataFields}
                                                onFieldChange={onFieldChange}
                                                onFieldBlur={onFieldBlur}
                                                layerURLBase={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}`}
                                                geometrySelectionRenderer={this.geometrySelectionRenderer}
                                                geometryTables={this.geometryTables}
                                            />
                                        </React.Fragment>
                                    )}

                                    {/* // For chip input-based expression editors (if needed) */}
                                    {/* <MyField
                                    name="valueExpression"
                                    component={ChipInput}
                                    hintText="Write an expression..."
                                    floatingLabelText="Value expression"
                                    floatingLabelFixed={true}
                                    fullWidth={true}
                                    dataSource={selectedColumns}
                                    dataSourceConfig={{ text: 'name', value: 'name' }}
                                    openOnFocus={true}
                                    onBlur={(event: any, newValue: string, previousValue: string) =>
                                        onFieldBlur(event.target.name, newValue, previousValue)}
                                /> */}

                                    {visibleComponent === eVisibleComponent.VALUE_EXPRESSION && (
                                        <React.Fragment>
                                            <ValueExpressionContainer onApply={onApplyValueExpression} />
                                        </React.Fragment>
                                    )}

                                    {visibleComponent === eVisibleComponent.FILTER_EXPRESSION && (
                                        <React.Fragment>
                                            <FilterExpressionContainer onApply={onApplyFilterExpression} />
                                        </React.Fragment>
                                    )}
                                </TabContainer>
                            </Tab>
                            {/* END DATA TAB */}

                            {/* START STYLE TAB */}
                            <Tab
                                value={2}
                                label="STYLE"
                                containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/style`} />}
                            >
                                <TabContainer>
                                    <Fields
                                        names={[
                                            "fillColourScheme",
                                            "fillColourSchemeLevels",
                                            "fillColourScaleFlip",
                                            "fillOpacity",
                                            "borderColour",
                                            "borderSize",
                                            "scaleMin",
                                            "scaleMax",
                                        ]}
                                        component={StylingFields}
                                        onFieldChange={onFieldChange}
                                        onFieldBlur={onFieldBlur}
                                        initialValues={initialValues}
                                        colourinfo={colourinfo}
                                        doFill={doFill}
                                        isPointGeom={isPointGeom}
                                    />

                                    {layerHash !== null && doFill && (
                                        <React.Fragment>
                                            <PaddedDivider />
                                            <LayerQuerySummaryContainer
                                                mapId={mapId}
                                                layerHash={layerHash}
                                                onFitScaleToData={onFitScaleToData}
                                            />
                                        </React.Fragment>
                                    )}
                                </TabContainer>
                            </Tab>
                            {/* END STYLE TAB */}
                        </Tabs>

                        <HiddenButton type="submit" />
                    </form>
                </MasterFlexboxItem>

                <MasterFlexboxItemBottomFixed>
                    <Toolbar>
                        {visibleComponent === eVisibleComponent.LAYER_FORM && (
                            <React.Fragment>
                                <ToolbarGroup firstChild={true} />

                                <ToolbarGroup lastChild={true}>
                                    <MyRaisedButton
                                        label={"Undo"}
                                        disabled={isDirty === false}
                                        onClick={onResetForm}
                                        primary={true}
                                        icon={<ContentUndo />}
                                    />
                                    <MyRaisedButton label={"Done"} onClick={onFormComplete} primary={true} icon={<AvPlaylistAddCheck />} />
                                </ToolbarGroup>
                            </React.Fragment>
                        )}

                        {(visibleComponent === eVisibleComponent.VALUE_EXPRESSION ||
                            visibleComponent === eVisibleComponent.FILTER_EXPRESSION) && (
                            <React.Fragment>
                                <ToolbarGroup firstChild={true} />

                                <ToolbarGroup lastChild={true}>
                                    <ClickableIconButton
                                        tooltip="Return to the layer editor"
                                        tooltipPosition="top-right"
                                        onClick={onCloseExpressionEditor}
                                        containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                                    >
                                        <ActionCheckCircle color={muiThemePalette.alternateTextColor} />
                                    </ClickableIconButton>
                                </ToolbarGroup>
                            </React.Fragment>
                        )}
                    </Toolbar>
                </MasterFlexboxItemBottomFixed>
            </MasterFlexboxContainer>
        )
    }
}

// Decorate the form component
let LayerFormReduxForm = reduxForm({
    form: "layerForm", // a unique name for this form
    enableReinitialize: true,
    onChange: (values: object, dispatch: Function, props: any) => {
        props.onFormChange(values, dispatch, props)
    },
    onSubmitFail: (a: any, b: any, c: any) => {
        console.log("onSubmitFail", a, b, c)
    },
})(LayerForm)

export default LayerFormReduxForm
