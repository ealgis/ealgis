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

const TabContainer = styled.div`margin: 10px;`

const HiddenButton = styled.button`display: none;`

const ExpressionContainer = styled.div`
    margin-top: 10px;
    margin-bottom: 25px;
`

const PaddedDivider = styled(Divider)`
    margin-top: 15px !important;
    margin-bottom: 15px !important;
`

const PaddedCheckbox = styled(Checkbox)`margin-top: 15px !important;`

export interface IProps {
    muiThemePalette: IMUIThemePalette
    mapId: number
    mapNameURLSafe: string
    layerId: number
    expression: { [key: string]: any }
    expressionMode: eLayerValueExpressionMode
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

class ValueExpressionEditor extends React.Component<IProps, IState> {
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
            layerId,
            expression,
            expressionMode,
            advancedModeModalOpen,
            onFieldChange,
            onApply,
            onChangeExpressionMode,
            onToggleAdvModeModalState,
        } = this.props

        const col1: any = expression["col1"]
        const mapMultiple: any = expression["map_multiple"]
        const col2: any = expression["col2"]
        const asPercentage: any = expression["as_percentage"]

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
                        <ExpressionPartItem value={col1} onClick={(event: any) => this.handleTouchTap(event, "col1")} />
                    </ExpressionContainer>
                )}

                {expressionMode === eLayerValueExpressionMode.PROPORTIONAL && (
                    <ExpressionContainer>
                        <ExpressionPartItem value={col1} onClick={(event: any) => this.handleTouchTap(event, "col1")} />
                        <ExpressionPartItem value={col2} onClick={(event: any) => this.handleTouchTap(event, "col2")} />
                    </ExpressionContainer>
                )}

                {(expressionMode === eLayerValueExpressionMode.SINGLE || expressionMode === eLayerValueExpressionMode.PROPORTIONAL) && (
                    <ExpressionPartSelectorContainer
                        componentId={eEalUIComponent.VALUE_EXPRESSION_EDITOR}
                        field={this.state.field!}
                        open={this.state.open}
                        anchorEl={this.state.anchorEl}
                        handleRequestClose={this.handleRequestClose}
                        onFieldChange={(evt: object, key: number, payload: IColumn) => {
                            console.log("onFieldChange", payload)
                            onFieldChange({ field: this.state.field, value: payload })
                        }}
                        showCreateGroup={false}
                        showValueSpecial={false}
                        showNumericalInput={false}
                        showRelatedColumns={false}
                    />
                )}

                {expressionMode === eLayerValueExpressionMode.ADVANCED && <ExpressionContainer>Advanced Mode!</ExpressionContainer>}

                {expressionMode !== eLayerValueExpressionMode.NOT_SET && (
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

export default ValueExpressionEditor
