import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import { IStore, IMUIThemePalette, ILayer, IColumnInfo, ISelectedColumn, IColumn, eEalUIComponent } from "../../redux/modules/interfaces"

import Divider from "material-ui/Divider"
import Checkbox from "material-ui/Checkbox"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"

import ExpressionPartItem from "../expression-part-item/ExpressionPartItem"
import ExpressionPartSelectorContainer from "../expression-part-selector/ExpressionPartSelectorContainer"

const PaddedDivider = styled(Divider)`
    margin-top: 15px !important;
    margin-bottom: 15px !important;
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
    onFieldChange: Function
    onApply: any
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
            onFieldChange,
            onApply,
        } = this.props

        const col1: any = expression["col1"]
        const operator: any = expression["operator"]
        const col2: any = expression["col2"]

        return (
            <div>
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

                <PaddedDivider />
                <br />
                <RaisedButton label={"Apply"} primary={true} onTouchTap={onApply} />
                <RaisedButton
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
