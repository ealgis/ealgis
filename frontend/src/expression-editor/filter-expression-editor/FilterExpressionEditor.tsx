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
    columninfo: IColumnInfo
    expression: { [key: string]: any }
    onFieldChange: Function
    onApply: any
}

class FilterExpressionEditor extends React.Component<IProps, {}> {
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
        } = this.props

        // console.log("expression", expression)

        const col1: any = expression["col1"]
        const operator: any = expression["operator"]
        const col2: any = expression["col2"]

        return (
            <div>
                <SelectField
                    floatingLabelText="Select a column"
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
                </SelectField>

                <SelectField
                    floatingLabelText="Select an operator"
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

                <SelectField
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
                </SelectField>

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
