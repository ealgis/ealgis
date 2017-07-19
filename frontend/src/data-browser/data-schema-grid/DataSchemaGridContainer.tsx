import * as React from "react"
import { connect } from "react-redux"
import DataSchemaGrid from "./DataSchemaGrid"
import { toggleModalState } from "../../redux/modules/app"
import { IStore, IMUIThemePalette, IMUIThemeProps } from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

interface IProps {}

export interface IStoreProps {
    // From Props
    muiThemePalette: IMUIThemePalette
}

export interface IDispatchProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class DataSchemaGridContainer extends React.Component<IProps & IStoreProps & IDispatchProps & IRouteProps, {}> {
    render() {
        const { muiThemePalette } = this.props

        return <DataSchemaGrid muiThemePalette={muiThemePalette} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IMUIThemeProps): IStoreProps => {
    const {} = state
    return {
        muiThemePalette: ownProps.muiTheme.palette,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {}
}

const DataSchemaGridContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(
    DataSchemaGridContainer
)

export default muiThemeable()(DataSchemaGridContainerWrapped)
