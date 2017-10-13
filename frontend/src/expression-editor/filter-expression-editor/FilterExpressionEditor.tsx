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

import Popover from "material-ui/Popover"
import { List, ListItem } from "material-ui/List"
import TextField from "material-ui/TextField"
import ContentInbox from "material-ui/svg-icons/content/inbox"
import ActionGrade from "material-ui/svg-icons/action/grade"
import ContentSend from "material-ui/svg-icons/content/send"
import ContentDrafts from "material-ui/svg-icons/content/drafts"
import ActionInfo from "material-ui/svg-icons/action/info"
import ActionViewColumn from "material-ui/svg-icons/action/view-column"
import ActionGroupWork from "material-ui/svg-icons/action/group-work"
import ActionInput from "material-ui/svg-icons/action/input"
import ActionStars from "material-ui/svg-icons/action/stars"
import AlertWarning from "material-ui/svg-icons/alert/warning"

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
    columninfo: IColumnInfo
    expression: { [key: string]: any }
    onFieldChange: Function
    onApply: any
    onOpenDataBrowser: Function
}

export interface IState {
    open: boolean
    anchorEl?: any
}

class FilterExpressionEditor extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props)
        this.state = { open: false }

        // @TODO Do we need this?
        // props.router.setRouteLeaveHook(props.route, this.routerWillLeave.bind(this))
    }

    handleTouchTap = (event: any) => {
        // This prevents ghost click.
        event.preventDefault()

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
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
            onFieldChange,
            onApply,
            onOpenDataBrowser,
        } = this.props

        console.log("expression", expression)

        const col1: any = expression["col1"]
        const operator: any = expression["operator"]
        const col2: any = expression["col2"]

        // FIXME: Don't assume an integery string is not a column (they may not always start with letters)

        if ("id" in col1) {
            let col1Element: any = (
                <ListItem
                    primaryText={`${col1.metadata_json.type}, ${col1.metadata_json.kind}`}
                    secondaryText="Your status is visible to everyone you use with"
                    leftIcon={<ActionViewColumn />}
                    onClick={this.handleTouchTap}
                />
            )
        } else {
            let col1Element: any = (
                <ListItem
                    primaryText="Show your status"
                    secondaryText="Your status is visible to everyone you use with"
                    leftIcon={<AlertWarning />}
                    onClick={this.handleTouchTap}
                />
            )
        }

        if (/^\d+$/.test(col2)) {
            let col2Element = (
                <ListItem
                    primaryText={col2}
                    secondaryText="Your status is visible to everyone you use with"
                    leftIcon={<ActionInput />}
                    onClick={this.handleTouchTap}
                />
            )
        } else if (col2 === "value-special") {
            let col2Element = (
                <ListItem
                    primaryText="Profile photo"
                    secondaryText="Change your Google+ profile photo"
                    leftIcon={<ActionStars />}
                    onClick={this.handleTouchTap}
                />
            )
        } else if (col2 === "some-group") {
            let col2Element = (
                <ListItem
                    primaryText="Profile photo"
                    secondaryText="Change your Google+ profile photo"
                    leftIcon={<ActionGroupWork />}
                    onClick={this.handleTouchTap}
                />
            )
        } else if ("id" in col2) {
            let col2Element = (
                <ListItem
                    primaryText="Show your status"
                    secondaryText="Your status is visible to everyone you use with"
                    leftIcon={<ActionViewColumn />}
                    onClick={this.handleTouchTap}
                />
            )
        } else {
            let col2Element = (
                <ListItem
                    primaryText="Show your status"
                    secondaryText="Your status is visible to everyone you use with"
                    leftIcon={<AlertWarning />}
                    onClick={this.handleTouchTap}
                />
            )
        }

        return (
            <div>
                {col1Element}

                {/* <SelectField
                    floatingLabelText="Choose a column"
                    value={col1 ? col1 : null}
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
                            <MenuItem key={key} value={column} primaryText={`${column.metadata_json.type}, ${column.metadata_json.kind}`} />
                        )
                    })}
                </SelectField> */}

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

                {/* <SelectField
                    floatingLabelText="Select another column"
                    value={col2 ? col2 : null}
                    onChange={(evt: object, key: number, payload: IColumn) => {
                        onFieldChange({ field: "col2", value: payload })
                    }}
                    autoWidth={true}
                    fullWidth={true}
                >
                    {layerDefinition.selectedColumns.map((columnStub: ISelectedColumn, key: number) => {
                        const columnUID = `${columnStub.schema}-${columnStub.id}`
                        const column: IColumn = columninfo[columnUID]
                        return (
                            <MenuItem key={key} value={column} primaryText={`${column.metadata_json.type}, ${column.metadata_json.kind}`} />
                        )
                    })}
                </SelectField> */}

                <br />
                <br />

                {col2Element}

                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ horizontal: "right", vertical: "top" }}
                    targetOrigin={{ horizontal: "left", vertical: "bottom" }}
                    onRequestClose={this.handleRequestClose}
                    style={{ width: "350px" }}
                >
                    <List>
                        <ListItem
                            primaryText="Profile photo"
                            secondaryText="Change your Google+ profile photo"
                            leftIcon={<ActionGroupWork />}
                            primaryTogglesNestedList={true}
                            nestedItems={[
                                <ListItem key={1}>
                                    <RaisedButton
                                        label={"Create Group"}
                                        primary={true}
                                        onClick={(evt: object) => {
                                            onFieldChange({ field: "col2", value: "some-group" })
                                        }}
                                    />
                                </ListItem>,
                            ]}
                        />
                        <ListItem
                            primaryText="Profile photo"
                            secondaryText="Change your Google+ profile photo"
                            onClick={(evt: object) => {
                                onFieldChange({ field: "col2", value: "value-special" })
                            }}
                            leftIcon={<ActionStars />}
                        />
                        <ListItem
                            primaryText="Profile photo"
                            secondaryText="Change your Google+ profile photo"
                            leftIcon={<ActionInput />}
                            primaryTogglesNestedList={true}
                            nestedItems={[
                                <ListItem key={1} disabled={true}>
                                    <TextField hintText="Hint Text" />
                                    <RaisedButton
                                        label={"OK"}
                                        primary={true}
                                        onClick={(evt: object) => {
                                            onFieldChange({ field: "col2", value: "12" })
                                        }}
                                    />
                                </ListItem>,
                            ]}
                        />

                        <ListItem
                            primaryText="Show your status"
                            secondaryText="Your status is visible to everyone you use with"
                            leftIcon={<ActionViewColumn />}
                            onClick={(evt: object) => {
                                onFieldChange({ field: "col2", value: { id: "foo" } })
                            }}
                        />
                        <ListItem
                            primaryText="Profile photo"
                            secondaryText="Change your Google+ profile photo"
                            leftIcon={<ActionViewColumn />}
                            onClick={(evt: object) => {
                                onFieldChange({ field: "col2", value: { id: "foo" } })
                            }}
                        />
                        <ListItem disabled={true}>
                            <RaisedButton
                                label={"Search For Data"}
                                primary={true}
                                fullWidth={true}
                                onClick={(evt: object) => {
                                    onOpenDataBrowser("filter_col_1")
                                }}
                            />
                        </ListItem>
                    </List>
                </Popover>
                <PaddedDivider />
                <br />
                <RaisedButton label={"Apply"} primary={true} onTouchTap={onApply} />
                <RaisedButton
                    containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}/data`} />}
                    label={"Close"}
                    primary={true}
                    onTouchTap={() => {}}
                />
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

export default FilterExpressionEditor
