import * as React from "react"
import { connect } from "react-redux"
import DataSchemaGrid from "./DataSchemaGrid"
import { toggleModalState } from "../../redux/modules/app"
import { IStore, ISchemaInfo, IMUITheme, IMUIThemePalette } from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

interface IProps {
    handleClickSchema: Function
}

export interface IStoreProps {
    // From Props
    schemainfo: ISchemaInfo
    muiThemePalette: IMUIThemePalette
}

export interface IDispatchProps {}

interface IOwnProps {
    muiTheme: IMUITheme
}

export class DataSchemaGridContainer extends React.Component<IProps & IStoreProps & IDispatchProps, {}> {
    render() {
        const { schemainfo, handleClickSchema, muiThemePalette } = this.props

        return <DataSchemaGrid schemainfo={schemainfo} handleClickSchema={handleClickSchema} muiThemePalette={muiThemePalette} />
    }
}

const mapStateToProps = (state: IStore, ownProps: any): IStoreProps => {
    const { ealgis } = state

    return {
        schemainfo: ealgis.schemainfo,
        muiThemePalette: ownProps.muiTheme.palette,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {}
}

const DataSchemaGridContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataSchemaGridContainer)

export default muiThemeable()(DataSchemaGridContainerWrapped)
