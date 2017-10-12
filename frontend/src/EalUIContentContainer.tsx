import * as React from "react"
import { connect } from "react-redux"
import EalUIContent from "./EalUIContent"
import { IStore, eEalUIComponent } from "./redux/modules/interfaces"

interface IProps {}

export interface IStoreProps {
    component: eEalUIComponent
    params: any
}

export interface IDispatchProps {}

interface IOwnProps {
    params: any
}

export class EalUIContentContainer extends React.Component<IProps & IStoreProps & IDispatchProps, {}> {
    render() {
        const { component, params } = this.props

        return <EalUIContent component={component} params={params} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app } = state

    return {
        component: app.activeContentComponent,
        params: ownProps.params,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {}
}

const EalUIContentContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(EalUIContentContainer)

export default EalUIContentContainerWrapped
