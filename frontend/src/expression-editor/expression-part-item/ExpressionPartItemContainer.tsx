// NOT USED

import * as React from "react"
import { connect } from "react-redux"
import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { withRouter } from "react-router"
import { isEqual, debounce, reduce } from "lodash-es"
import { values as objectValues } from "core-js/library/fn/object"
import ExpressionPartItem from "../expression-part-item/ExpressionPartItem"
import { toggleModalState } from "../../redux/modules/app"
import { setActiveContentComponent } from "../../redux/modules/app"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import {
    IStore,
    IEALGISModule,
    ILayerQuerySummary,
    IGeomInfo,
    IGeomTable,
    IColourInfo,
    IColumnInfo,
    IMap,
    ILayer,
    IColumn,
    ISelectedColumn,
    IMUITheme,
    IMUIThemePalette,
    eEalUIComponent,
    IDataBrowserResult,
} from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

export interface IProps {
    onClick: Function
}

export interface IStoreProps {}

export interface IDispatchProps {}

interface IOwnProps {}

interface IState {}

export class ExpressionPartItemContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IState> {
    render() {
        const { onClick } = this.props

        return <ExpressionPartItem value={""} onClick={onClick} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const ExpressionPartItemContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(ExpressionPartItemContainer)

export default muiThemeable()(withRouter(ExpressionPartItemContainerWrapped))
