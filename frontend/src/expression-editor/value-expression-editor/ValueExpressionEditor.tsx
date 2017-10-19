import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import { IStore, IMUIThemePalette, ISelectedColumn, IColumn } from "../../redux/modules/interfaces"

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
    layerId: number
    expression: { [key: string]: any }
    onFieldChange: Function
    onApply: any
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
        const { muiThemePalette, mapId, mapNameURLSafe, layerId, expression, onFieldChange, onApply } = this.props

        const col1: any = expression["col1"]
        const mapMultiple: any = expression["map_multiple"]
        const col2: any = expression["col2"]
        const asPercentage: any = expression["as_percentage"]

        return (
            <div>
                <ExpressionPartItem value={col1} onClick={(event: any) => this.handleTouchTap(event, "col1")} />

                <ExpressionPartSelectorContainer
                    field={this.state.field!}
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    handleRequestClose={this.handleRequestClose}
                    onFieldChange={(evt: object, key: number, payload: IColumn) => {
                        console.log("onFieldChange", payload)
                        onFieldChange({ field: this.state.field, value: payload })
                    }}
                    showCreateGroup={col1 !== undefined}
                    showValueSpecial={false}
                    showNumericalInput={false}
                    showRelatedColumns={false}
                />

                <PaddedDivider />

                <Checkbox
                    label="Map multiple things"
                    checked={mapMultiple ? mapMultiple : false}
                    onCheck={(evt: object, isInputChecked: boolean) => {
                        onFieldChange({ field: "map_multiple", value: isInputChecked })
                    }}
                />

                <ExpressionPartItem
                    value={col2}
                    disabled={mapMultiple === undefined || mapMultiple === false ? true : false}
                    onClick={(event: any) => this.handleTouchTap(event, "col2")}
                />

                <PaddedCheckbox
                    label="As a percentage?"
                    checked={asPercentage ? asPercentage : false}
                    onCheck={(evt: object, isInputChecked: boolean) => {
                        onFieldChange({ field: "as_percentage", value: isInputChecked })
                    }}
                    disabled={mapMultiple === undefined || mapMultiple === false ? true : false}
                />

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

export default ValueExpressionEditor
