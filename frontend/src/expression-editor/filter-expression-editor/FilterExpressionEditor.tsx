import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import {
    IStore,
    IMUIThemePalette,
    ILayer,
    IColumnInfo,
    ISelectedColumn,
    IColumn,
    eEalUIComponent,
    eLayerFilterExpressionMode,
} from "../../redux/modules/interfaces"

import { List, ListItem } from "material-ui/List"
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

import ExpressionPartItem from "../expression-part-item/ExpressionPartItem"
import ExpressionPartSelectorContainer from "../expression-part-selector/ExpressionPartSelectorContainer"

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
    layerDefinition: ILayer
    layerId: number
    layerHash: string
    columninfo: IColumnInfo
    expression: { [key: string]: any }
    expressionMode: eLayerFilterExpressionMode
    advancedModeModalOpen: boolean
    onFieldChange: Function
    onApply: any
    onChangeExpressionMode: Function
    onToggleAdvModeModalState: any
}

export interface IState {
    open: boolean
    anchorEl?: any
    field?: string
}

class FilterExpressionEditor extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props)
        this.state = { open: false }
    }

    handleTouchTap = (event: any, field: string) => {
        // This prevents ghost click.
        event.preventDefault()

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
            field: field,
        })
    }

    handleRequestClose = () => {
        this.setState({
            open: false,
        })
    }

    render() {
        const {
            muiThemePalette,
            mapId,
            mapNameURLSafe,
            layerDefinition,
            layerId,
            layerHash,
            columninfo,
            expression,
            expressionMode,
            advancedModeModalOpen,
            onFieldChange,
            onApply,
            onChangeExpressionMode,
            onToggleAdvModeModalState,
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
                        <ExpressionPartItem value={col1} onClick={(event: any) => this.handleTouchTap(event, "col1")} />

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
                            <MenuItem value={"!`="} primaryText="is not" />
                        </SelectField>

                        <br />
                        <br />

                        <ExpressionPartItem value={col2} onClick={(event: any) => this.handleTouchTap(event, "col2")} />

                        <ExpressionPartSelectorContainer
                            componentId={eEalUIComponent.FILTER_EXPRESSION_EDITOR}
                            field={this.state.field!}
                            open={this.state.open}
                            anchorEl={this.state.anchorEl}
                            handleRequestClose={this.handleRequestClose}
                            onFieldChange={onFieldChange}
                        />
                    </ExpressionContainer>
                )}

                {expressionMode === eLayerFilterExpressionMode.ADVANCED && <ExpressionContainer>Advanced Mode!</ExpressionContainer>}

                {expressionMode !== eLayerFilterExpressionMode.NOT_SET && (
                    <ExpressionRaisedButton label={"Apply"} primary={true} onTouchTap={onApply} />
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

export default FilterExpressionEditor
