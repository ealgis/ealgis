import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import { IStore, IMUIThemePalette, ILayer, IColumnInfo, ISelectedColumn, IColumn } from "../../redux/modules/interfaces"

import Divider from "material-ui/Divider"
import { Tabs, Tab } from "material-ui/Tabs"
import Dialog from "material-ui/Dialog"
import Subheader from "material-ui/Subheader"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import Checkbox from "material-ui/Checkbox"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"
import FlatButton from "material-ui/FlatButton"
import IconButton from "material-ui/IconButton"

import NavigationClose from "material-ui/svg-icons/navigation/close"
import ContentCreate from "material-ui/svg-icons/content/create"
import EditorInsertChart from "material-ui/svg-icons/editor/insert-chart"
import ImagePalette from "material-ui/svg-icons/image/palette"

const TabContainer = styled.div`margin: 10px;`

const HiddenButton = styled.button`display: none;`

const PaddedDivider = styled(Divider)`
    margin-top: 15px !important;
    margin-bottom: 15px !important;
`

const PaddedCheckbox = styled(Checkbox)`margin-top: 15px !important;`

export interface IProps {
    muiThemePalette: IMUIThemePalette
    mapId: number
    mapNameURLSafe: string
    layerDefinition: ILayer
    layerId: number
    layerHash: string
    tabName: string
    columninfo: IColumnInfo
    onFieldChange: Function
    fields: Array<{ field: string; value: any }>
    onApply: any
}

class ValueExpressionEditor extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            mapId,
            mapNameURLSafe,
            layerDefinition,
            layerId,
            layerHash,
            tabName,
            columninfo,
            onFieldChange,
            fields,
            onApply,
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

        // console.log(layerDefinition.selectedColumns)

        const col1: any = fields.find((value: { field: string; value: any }) => value.field == "col1")
        const mapMultiple: any = fields.find((value: { field: string; value: any }) => value.field == "map_multiple")
        const operator: any = fields.find((value: { field: string; value: any }) => value.field == "operator")
        const col2: any = fields.find((value: { field: string; value: any }) => value.field == "col2")
        const asPercentage: any = fields.find((value: { field: string; value: any }) => value.field == "as_percentage")

        return (
            <div>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <RaisedButton label={"Apply"} primary={true} onTouchTap={onApply} />
                        <RaisedButton label={"Close"} primary={true} onTouchTap={() => {}} />
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

                <form onSubmit={() => {}}>
                    <Tabs initialSelectedIndex={tabId} tabItemContainerStyle={{ backgroundColor: muiThemePalette.accent3Color }}>
                        {/* START DESCRIBE TAB */}
                        <Tab
                            icon={<ContentCreate />}
                            label="DESCRIBE"
                            containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}`} />}
                        >
                            <TabContainer>1</TabContainer>
                        </Tab>
                        {/* END DESCRIBE TAB */}

                        {/* START DATA TAB */}
                        <Tab
                            icon={<EditorInsertChart />}
                            label="DATA"
                            containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                        >
                            <TabContainer>
                                <SelectField
                                    floatingLabelText="Select a column"
                                    value={col1 ? col1.value : null}
                                    onChange={(evt: object, key: number, payload: IColumn) => {
                                        onFieldChange({ field: "col1", value: payload })
                                    }}
                                    autoWidth={true}
                                    fullWidth={true}
                                >
                                    {layerDefinition.selectedColumns.map((columnStub: ISelectedColumn, key: number) => {
                                        const columnUID = `${columnStub.schema}-${columnStub.id}`
                                        const column: IColumn = columninfo[columnUID]
                                        return (
                                            <MenuItem
                                                key={key}
                                                value={column}
                                                primaryText={`${column.metadata_json.type}, ${column.metadata_json.kind}`}
                                            />
                                        )
                                    })}
                                </SelectField>

                                <PaddedDivider />

                                <Checkbox
                                    label="Map multiple things"
                                    checked={mapMultiple ? mapMultiple.value : false}
                                    onCheck={(evt: object, isInputChecked: boolean) => {
                                        onFieldChange({ field: "map_multiple", value: isInputChecked })
                                    }}
                                />

                                <SelectField
                                    floatingLabelText="Select an operator"
                                    value={operator ? operator.value : null}
                                    onChange={(evt: object, key: number, payload: string) => {
                                        onFieldChange({ field: "operator", value: payload })
                                    }}
                                    disabled={mapMultiple === undefined || mapMultiple.value === false ? true : false}
                                >
                                    <MenuItem value={">"} primaryText="greater than" />
                                    <MenuItem value={">="} primaryText="greater than or equal to" />
                                    <MenuItem value={"<"} primaryText="less than" />
                                    <MenuItem value={"<="} primaryText="less than or equal to" />
                                    <MenuItem value={"="} primaryText="equals" />
                                    <MenuItem value={"!="} primaryText="is not" />
                                </SelectField>

                                <SelectField
                                    floatingLabelText="Select another column"
                                    value={col2 ? col2.value : null}
                                    onChange={(evt: object, key: number, payload: IColumn) => {
                                        onFieldChange({ field: "col2", value: payload })
                                    }}
                                    disabled={mapMultiple === undefined || mapMultiple.value === false ? true : false}
                                    autoWidth={true}
                                    fullWidth={true}
                                >
                                    {layerDefinition.selectedColumns.map((columnStub: ISelectedColumn, key: number) => {
                                        const columnUID = `${columnStub.schema}-${columnStub.id}`
                                        const column: IColumn = columninfo[columnUID]
                                        return (
                                            <MenuItem
                                                key={key}
                                                value={column}
                                                primaryText={`${column.metadata_json.type}, ${column.metadata_json.kind}`}
                                            />
                                        )
                                    })}
                                </SelectField>

                                <PaddedCheckbox
                                    label="As a percentage?"
                                    checked={asPercentage ? asPercentage.value : false}
                                    onCheck={(evt: object, isInputChecked: boolean) => {
                                        console.log("foo")
                                        onFieldChange({ field: "as_percentage", value: isInputChecked })
                                    }}
                                    disabled={mapMultiple === undefined || mapMultiple.value === false ? true : false}
                                />
                            </TabContainer>
                        </Tab>
                        {/* END DATA TAB */}

                        {/* START VISUALISE TAB */}
                        <Tab
                            icon={<ImagePalette />}
                            label="VISUALISE"
                            containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/visualise`} />}
                        >
                            <TabContainer>3</TabContainer>
                        </Tab>
                        {/* END VISUALISE TAB */}
                    </Tabs>

                    <HiddenButton type="submit" />
                </form>

                {/* <Dialog
                    title="You have unsaved changes - what would you like to do?"
                    actions={[
                        <FlatButton label="Discard Changes" secondary={true} onTouchTap={onModalDiscardForm} />,
                        <FlatButton label="Save Changes" primary={true} onTouchTap={onModalSaveForm} />,
                    ]}
                    modal={true}
                    open={dirtyFormModalOpen}
                /> */}
            </div>
        )
    }
}

export default ValueExpressionEditor
