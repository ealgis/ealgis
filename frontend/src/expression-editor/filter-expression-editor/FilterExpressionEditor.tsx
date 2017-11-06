import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import {
    IStore,
    IMUIThemePalette,
    ILayer,
    ISelectedColumn,
    IColumn,
    eEalUIComponent,
    eLayerFilterExpressionMode,
} from "../../redux/modules/interfaces"

import { List, ListItem } from "material-ui/List"
import TextField from "material-ui/TextField"
import Avatar from "material-ui/Avatar"
import FileFolder from "material-ui/svg-icons/file/folder"
import ActionAssignment from "material-ui/svg-icons/action/assignment"
import ActionSettings from "material-ui/svg-icons/action/settings"
import { blue500, yellow600 } from "material-ui/styles/colors"
import DropDownMenu from "material-ui/DropDownMenu"
import { Tabs, Tab } from "material-ui/Tabs"
import Dialog from "material-ui/Dialog"
import Subheader from "material-ui/Subheader"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import Divider from "material-ui/Divider"
import Checkbox from "material-ui/Checkbox"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"
import FlatButton from "material-ui/FlatButton"
import ActionCode from "material-ui/svg-icons/action/code"

import ExpressionPartItemContainer from "../expression-part-item/ExpressionPartItemContainer"

// Silence "TS2339: Property 'onBlur' does not exist'" warnings
class BlurableTextField extends React.Component<any, any> {
    render() {
        return <TextField {...this.props} />
    }
}
class ClickableRaisedButton extends React.Component<any, any> {
    render() {
        return <RaisedButton {...this.props} />
    }
}

const ExpressionEditorToolbar = styled(Toolbar)`background-color: white !important;`
const ExpressionModeDropDownMenu = styled(DropDownMenu)`
    top: -5px;
    margin-left: 15px;
`
const ExpressionRaisedButton = styled(ClickableRaisedButton)`
    margin-left: 10px;
    margin-right: 10px;
`

const ExpressionContainer = styled.div`
    margin-top: 10px;
    margin-bottom: 25px;
`

const ExpressionOpenDataBrowser = styled.div`margin-bottom: 10px;`

export interface IProps {
    muiThemePalette: IMUIThemePalette
    mapId: number
    mapNameURLSafe: string
    layerId: number
    expression: { [key: string]: any }
    expressionCompiled: string
    expressionMode: eLayerFilterExpressionMode
    advancedModeModalOpen: boolean
    onFieldChange: Function
    onExpressionChange: any
    onApply: any
    onApplyAdvanced: any
    onChangeExpressionMode: Function
    onToggleAdvModeModalState: any
    onClose: Function
    openDataBrowser: Function
}

class FilterExpressionEditor extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            mapId,
            mapNameURLSafe,
            layerId,
            expression,
            expressionCompiled,
            expressionMode,
            advancedModeModalOpen,
            onFieldChange,
            onExpressionChange,
            onApply,
            onApplyAdvanced,
            onChangeExpressionMode,
            onToggleAdvModeModalState,
            onClose,
            openDataBrowser,
        } = this.props

        const col1: any = expression["col1"]
        const operator: any = expression["operator"]
        const col2: any = expression["col2"]

        const advancedModeDialogActions = [
            <FlatButton label="No" primary={true} onTouchTap={onToggleAdvModeModalState} />,
            <FlatButton
                label="Yes"
                primary={true}
                onTouchTap={() => {
                    onChangeExpressionMode(eLayerFilterExpressionMode.ADVANCED)
                    onToggleAdvModeModalState()
                }}
            />,
        ]

        return (
            <div>
                <ExpressionEditorToolbar>
                    <ToolbarGroup>
                        <ActionSettings style={{ marginRight: "10px" }} />
                        <ToolbarTitle text={expressionMode === eLayerFilterExpressionMode.NOT_SET ? "Choose a mode" : "Mode"} />
                        {expressionMode !== eLayerFilterExpressionMode.NOT_SET && <ToolbarSeparator />}
                        {expressionMode !== eLayerFilterExpressionMode.NOT_SET && (
                            <ExpressionModeDropDownMenu
                                value={expressionMode}
                                onChange={(event: any, key: number, mode: eLayerFilterExpressionMode) => {
                                    if (mode === eLayerFilterExpressionMode.ADVANCED) {
                                        onToggleAdvModeModalState()
                                    } else {
                                        onChangeExpressionMode(mode)
                                    }
                                }}
                            >
                                {expressionMode !== eLayerFilterExpressionMode.ADVANCED && (
                                    <MenuItem value={eLayerFilterExpressionMode.SIMPLE} primaryText="Simple" />
                                )}
                                <MenuItem value={eLayerFilterExpressionMode.ADVANCED} primaryText="Advanced" />
                            </ExpressionModeDropDownMenu>
                        )}
                    </ToolbarGroup>
                </ExpressionEditorToolbar>

                <Dialog title="Change Mode" actions={advancedModeDialogActions} modal={true} open={advancedModeModalOpen}>
                    Once you change to advanced mode you won't be able to change back. Would you like to continue?
                </Dialog>

                {expressionMode === eLayerFilterExpressionMode.NOT_SET && (
                    <List>
                        <ListItem
                            primaryText="Simple"
                            secondaryText="Filter against a single data point (e.g. Don't show suburbs where less than 50% of the population are UK migrants.)"
                            secondaryTextLines={2}
                            onClick={() => onChangeExpressionMode(eLayerFilterExpressionMode.SIMPLE)}
                        />
                        <ListItem
                            primaryText="Advanced"
                            secondaryText="Get as complex as you like with the ability to write your own Excel-like expressions."
                            secondaryTextLines={2}
                            onClick={() => onChangeExpressionMode(eLayerFilterExpressionMode.ADVANCED)}
                        />
                    </List>
                )}

                {expressionMode === eLayerFilterExpressionMode.SIMPLE && (
                    <ExpressionContainer>
                        <ExpressionPartItemContainer
                            componentId={eEalUIComponent.FILTER_EXPRESSION_EDITOR}
                            value={col1}
                            field={"col1"}
                            showCreateGroup={false}
                            showValueSpecial={true}
                            showNumericalInput={false}
                            showRelatedColumns={false}
                            onFieldChange={onFieldChange}
                        />

                        <ListItem
                            style={{ marginBottom: "20px" }}
                            leftIcon={<ActionCode style={{ marginTop: "36px" }} />}
                            innerDivStyle={{ paddingTop: "0px" }}
                        >
                            <SelectField
                                floatingLabelText="Choose an operator"
                                value={operator ? operator : null}
                                onChange={(evt: object, key: number, payload: string) => {
                                    onFieldChange({ field: "operator", value: payload })
                                }}
                            >
                                <MenuItem value={">"} primaryText="greater than" />
                                <MenuItem value={">="} primaryText="greater than or equal to" />
                                <MenuItem value={"<"} primaryText="less than" />
                                <MenuItem value={"<="} primaryText="less than or equal to" />
                                <MenuItem value={"="} primaryText="equals" />
                                <MenuItem value={"!="} primaryText="is not" />
                            </SelectField>
                        </ListItem>

                        <ExpressionPartItemContainer
                            componentId={eEalUIComponent.FILTER_EXPRESSION_EDITOR}
                            value={col2}
                            field={"col2"}
                            showCreateGroup={false}
                            showValueSpecial={false}
                            showNumericalInput={true}
                            showRelatedColumns={false}
                            onFieldChange={onFieldChange}
                        />
                    </ExpressionContainer>
                )}

                {expressionMode === eLayerFilterExpressionMode.ADVANCED && (
                    <ExpressionContainer>
                        <BlurableTextField
                            defaultValue={expressionCompiled}
                            name="filterExpression"
                            multiLine={true}
                            rows={2}
                            hintText="e.g. ..."
                            floatingLabelText="Enter an Excel-like expression"
                            floatingLabelFixed={true}
                            fullWidth={true}
                            onBlur={(event: any, newValue: string) => onExpressionChange(event.target.value)}
                        />
                    </ExpressionContainer>
                )}

                {expressionMode === eLayerFilterExpressionMode.ADVANCED && (
                    <ExpressionOpenDataBrowser>
                        <ExpressionRaisedButton label={"Open Data Browser"} primary={true} onTouchTap={openDataBrowser} />
                    </ExpressionOpenDataBrowser>
                )}

                {expressionMode === eLayerFilterExpressionMode.SIMPLE && (
                    <ExpressionRaisedButton label={"Apply"} primary={true} onTouchTap={onApply} />
                )}
                {expressionMode === eLayerFilterExpressionMode.ADVANCED && (
                    <ExpressionRaisedButton label={"Apply"} primary={true} onTouchTap={onApplyAdvanced} />
                )}

                <ExpressionRaisedButton
                    containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                    label={"Close"}
                    primary={true}
                    onClick={onClose}
                />
            </div>
        )
    }
}

export default FilterExpressionEditor
