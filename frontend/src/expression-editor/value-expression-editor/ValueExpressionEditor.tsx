import Dialog from "material-ui/Dialog"
import DropDownMenu from "material-ui/DropDownMenu"
import FlatButton from "material-ui/FlatButton"
import { List, ListItem } from "material-ui/List"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"
import TextField from "material-ui/TextField"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import { ActionSettings } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import { IMUIThemePalette, eEalUIComponent, eLayerValueExpressionMode } from "../../redux/modules/interfaces"
import ExpressionColumnSelectorContainer from "../expression-column-selector/ExpressionColumnSelectorContainer"

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

class PreventDoubleSubmitRaisedButton extends React.Component<any, any> {
    render() {
        const onKeyPress = (ev: any) => {
            if (ev.key === "Enter") {
                ev.preventDefault()
            }
        }
        return <ClickableRaisedButton onKeyPress={onKeyPress} {...this.props} />
    }
}

const ExpressionEditorToolbar = styled(Toolbar)`
    background-color: white !important;
`
const ExpressionModeDropDownMenu = styled(DropDownMenu)`
    top: -5px;
    margin-left: 15px;
`
const ExpressionRaisedButton = styled(PreventDoubleSubmitRaisedButton)`
    margin-left: 10px;
    margin-right: 10px;
`

const ExpressionContainer = styled.div`
    margin-top: 10px;
    margin-bottom: 25px;
`

const ExpressionOpenDataBrowser = styled.div`
    margin-bottom: 10px;
`

// https://stackoverflow.com/a/15557694
const DividedByDivider = styled.h3`
    position: relative;
    z-index: 1;
    overflow: hidden;
    text-align: center;

    &:before,
    :after {
        position: absolute;
        top: 51%;
        overflow: hidden;
        width: 47%;
        height: 2px;
        content: "\a0";
        background-color: lightgrey;
    }

    &:before {
        margin-left: -50%;
        text-align: right;
    }

    &:after {
        margin-left: 3%;
    }
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
    onRemoveColumn: Function
    onExpressionChange: Function
    onApplyAdvanced: any
    onChangeExpressionMode: Function
    onToggleAdvModeModalState: any
    openDataBrowser: Function
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
            onRemoveColumn,
            onExpressionChange,
            onApplyAdvanced,
            onChangeExpressionMode,
            onToggleAdvModeModalState,
            openDataBrowser,
        } = this.props

        const advancedModeDialogActions = [
            <FlatButton label="No" primary={true} onClick={onToggleAdvModeModalState} />,
            <FlatButton
                label="Yes"
                primary={true}
                onClick={() => {
                    onChangeExpressionMode(eLayerValueExpressionMode.ADVANCED)
                    onToggleAdvModeModalState()
                }}
            />,
        ]

        return (
            <React.Fragment>
                <ExpressionEditorToolbar>
                    <ToolbarGroup>
                        <ActionSettings style={{ marginRight: "10px" }} />
                        <ToolbarTitle text={expressionMode === eLayerValueExpressionMode.NOT_SET ? "Choose a mode" : "Mode"} />
                        {expressionMode !== eLayerValueExpressionMode.NOT_SET && (
                            <React.Fragment>
                                <ToolbarSeparator />

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
                            </React.Fragment>
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
                        <ExpressionColumnSelectorContainer
                            componentId={eEalUIComponent.VALUE_EXPRESSION_EDITOR}
                            field={"colgroup1"}
                            columns={expression["colgroup1"]}
                            onRemoveColumn={onRemoveColumn}
                        />
                    </ExpressionContainer>
                )}

                {expressionMode === eLayerValueExpressionMode.PROPORTIONAL && (
                    <ExpressionContainer>
                        <ExpressionColumnSelectorContainer
                            componentId={eEalUIComponent.VALUE_EXPRESSION_EDITOR}
                            field={"colgroup1"}
                            columns={expression["colgroup1"]}
                            onRemoveColumn={onRemoveColumn}
                        />

                        <DividedByDivider>divided by</DividedByDivider>

                        <ExpressionColumnSelectorContainer
                            componentId={eEalUIComponent.VALUE_EXPRESSION_EDITOR}
                            field={"colgroup2"}
                            columns={expression["colgroup2"]}
                            onRemoveColumn={onRemoveColumn}
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

                {expressionMode === eLayerValueExpressionMode.ADVANCED && (
                    <ExpressionOpenDataBrowser>
                        <ExpressionRaisedButton label={"Open Data Browser"} primary={true} onClick={openDataBrowser} />
                    </ExpressionOpenDataBrowser>
                )}

                {expressionMode === eLayerValueExpressionMode.ADVANCED && (
                    <ExpressionRaisedButton label={"Apply Expression"} primary={true} onClick={onApplyAdvanced} />
                )}
            </React.Fragment>
        )
    }
}

export default ValueExpressionEditor
