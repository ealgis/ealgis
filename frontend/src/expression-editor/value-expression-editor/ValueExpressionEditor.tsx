import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import {
    IStore,
    IMUIThemePalette,
    ISelectedColumn,
    IColumn,
    eEalUIComponent,
    eLayerValueExpressionMode,
} from "../../redux/modules/interfaces"

import { List, ListItem } from "material-ui/List"
import TextField from "material-ui/TextField"
import Avatar from "material-ui/Avatar"
import FileFolder from "material-ui/svg-icons/file/folder"
import ActionAssignment from "material-ui/svg-icons/action/assignment"
import ActionSettings from "material-ui/svg-icons/action/settings"
import { blue500, yellow600 } from "material-ui/styles/colors"
import DropDownMenu from "material-ui/DropDownMenu"
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

import ExpressionPartItemContainer from "../expression-part-item/ExpressionPartItemContainer"

// Silence "TS2339: Property 'onBlur' does not exist'" warnings
class BlurableTextField extends React.Component<any, any> {
    render() {
        return <TextField {...this.props} />
    }
}

const ExpressionEditorToolbar = styled(Toolbar)`background-color: white !important;`
const ExpressionModeDropDownMenu = styled(DropDownMenu)`
    top: -5px;
    margin-left: 15px;
`
const ExpressionRaisedButton = styled(RaisedButton)`
    margin-left: 10px;
    margin-right: 10px;
`

const ExpressionContainer = styled.div`
    margin-top: 10px;
    margin-bottom: 25px;
`

export interface IProps {
    muiThemePalette: IMUIThemePalette
    mapId: number
    mapNameURLSafe: string
    layerId: number
    expression: { [key: string]: any }
    expressionCompiled: string
    expressionMode: eLayerValueExpressionMode
    advancedModeModalOpen: boolean
    onFieldChange: Function
    onExpressionChange: Function
    onApply: any
    onApplyAdvanced: any
    onChangeExpressionMode: Function
    onToggleAdvModeModalState: any
}

class ValueExpressionEditor extends React.Component<IProps, {}> {
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
        } = this.props

        const col1: any = expression["col1"]
        const col2: any = expression["col2"]

        const advancedModeDialogActions = [
            <FlatButton label="No" primary={true} onTouchTap={onToggleAdvModeModalState} />,
            <FlatButton
                label="Yes"
                primary={true}
                onTouchTap={() => {
                    onChangeExpressionMode(eLayerValueExpressionMode.ADVANCED)
                    onToggleAdvModeModalState()
                }}
            />,
        ]

        return (
            <div>
                <ExpressionEditorToolbar>
                    <ToolbarGroup>
                        <ActionSettings style={{ marginRight: "10px" }} />
                        <ToolbarTitle text={expressionMode === eLayerValueExpressionMode.NOT_SET ? "Choose a mode" : "Mode"} />
                        {expressionMode !== eLayerValueExpressionMode.NOT_SET && <ToolbarSeparator />}
                        {expressionMode !== eLayerValueExpressionMode.NOT_SET && (
                            <ExpressionModeDropDownMenu
                                value={expressionMode}
                                onChange={(event: any, key: number, mode: eLayerValueExpressionMode) => {
                                    if (mode === eLayerValueExpressionMode.ADVANCED) {
                                        onToggleAdvModeModalState()
                                    } else {
                                        onChangeExpressionMode(mode)
                                    }
                                }}
                            >
                                {expressionMode !== eLayerValueExpressionMode.ADVANCED && (
                                    <MenuItem value={eLayerValueExpressionMode.SINGLE} primaryText="Simple" />
                                )}
                                {expressionMode !== eLayerValueExpressionMode.ADVANCED && (
                                    <MenuItem value={eLayerValueExpressionMode.PROPORTIONAL} primaryText="Proportional" />
                                )}
                                <MenuItem value={eLayerValueExpressionMode.ADVANCED} primaryText="Advanced" />
                            </ExpressionModeDropDownMenu>
                        )}
                    </ToolbarGroup>
                </ExpressionEditorToolbar>

                <Dialog title="Change Mode" actions={advancedModeDialogActions} modal={true} open={advancedModeModalOpen}>
                    Once you change to advanced mode you won't be able to change back. Would you like to continue?
                </Dialog>

                {expressionMode === eLayerValueExpressionMode.NOT_SET && (
                    <List>
                        <ListItem
                            primaryText="Simple"
                            secondaryText="Map a single data point (e.g. The number of migrants from the UK in each suburb.)"
                            secondaryTextLines={2}
                            onClick={() => onChangeExpressionMode(eLayerValueExpressionMode.SINGLE)}
                        />
                        <ListItem
                            primaryText="Proportional"
                            secondaryText="Map two data points against each other (e.g. The percentage of migrants from the UK per suburb.)"
                            secondaryTextLines={2}
                            onClick={() => onChangeExpressionMode(eLayerValueExpressionMode.PROPORTIONAL)}
                        />
                        <ListItem
                            primaryText="Advanced"
                            secondaryText="Get as complex as you like with the ability to write your own Excel-like expressions."
                            secondaryTextLines={2}
                            onClick={() => onChangeExpressionMode(eLayerValueExpressionMode.ADVANCED)}
                        />
                    </List>
                )}

                {expressionMode === eLayerValueExpressionMode.SINGLE && (
                    <ExpressionContainer>
                        <ExpressionPartItemContainer
                            componentId={eEalUIComponent.VALUE_EXPRESSION_EDITOR}
                            value={col1}
                            field={"col1"}
                            showCreateGroup={false}
                            showValueSpecial={false}
                            showNumericalInput={false}
                            showRelatedColumns={false}
                            onFieldChange={onFieldChange}
                        />
                    </ExpressionContainer>
                )}

                {expressionMode === eLayerValueExpressionMode.PROPORTIONAL && (
                    <ExpressionContainer>
                        <ExpressionPartItemContainer
                            componentId={eEalUIComponent.VALUE_EXPRESSION_EDITOR}
                            value={col1}
                            field={"col1"}
                            showCreateGroup={false}
                            showValueSpecial={false}
                            showNumericalInput={false}
                            showRelatedColumns={false}
                            onFieldChange={onFieldChange}
                        />

                        <ExpressionPartItemContainer
                            componentId={eEalUIComponent.VALUE_EXPRESSION_EDITOR}
                            value={col2}
                            field={"col2"}
                            showCreateGroup={false}
                            showValueSpecial={false}
                            showNumericalInput={false}
                            showRelatedColumns={false}
                            onFieldChange={onFieldChange}
                        />
                    </ExpressionContainer>
                )}

                {expressionMode === eLayerValueExpressionMode.ADVANCED && (
                    <ExpressionContainer>
                        <BlurableTextField
                            defaultValue={expressionCompiled}
                            name="valueExpression"
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

                {expressionMode === eLayerValueExpressionMode.SINGLE ||
                    (expressionMode === eLayerValueExpressionMode.PROPORTIONAL && (
                        <ExpressionRaisedButton label={"Apply"} primary={true} onTouchTap={onApply} />
                    ))}
                {expressionMode === eLayerValueExpressionMode.ADVANCED && (
                    <ExpressionRaisedButton label={"Apply"} primary={true} onTouchTap={onApplyAdvanced} />
                )}

                <ExpressionRaisedButton
                    containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                    label={"Close"}
                    primary={true}
                    onTouchTap={() => {}}
                />
            </div>
        )
    }
}

export default ValueExpressionEditor
