import * as React from "react"
import { connect } from "react-redux"
import DataBrowserDialog from "./DataBrowserDialog"
import { toggleModalState } from "../../redux/modules/app"
import { IStore } from "../../redux/modules/interfaces"

interface IProps {}

export interface IStoreProps {
    // From Props
    dataBrowserModalOpen: boolean
}

export interface IDispatchProps {
    onToggleDataBrowserModalState: Function
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class DataBrowserDialogContainer extends React.Component<
    IProps & IStoreProps & IDispatchProps & IRouteProps,
    {}
> {
    render() {
        const { dataBrowserModalOpen, onToggleDataBrowserModalState } = this.props

        return (
            <DataBrowserDialog
                dataBrowserModalOpen={dataBrowserModalOpen}
                onToggleDataBrowserModalState={() => onToggleDataBrowserModalState()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const {} = state
    return { dataBrowserModalOpen: true }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onToggleDataBrowserModalState: () => {
            dispatch(toggleModalState("dataBrowser"))
        },
    }
}

const DataBrowserDialogContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(
    DataBrowserDialogContainer
)

export default DataBrowserDialogContainerWrapped
