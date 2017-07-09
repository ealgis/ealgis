import * as React from "react"
import CreateMapSidebar from "./CreateMapSidebar"
import { connect } from "react-redux"
import { IStore } from "../../redux/modules/interfaces"

export interface IProps {}

export interface IStoreProps {
    isApprovedUser: boolean
}

export class CreateMapSidebarContainer extends React.Component<IProps & IStoreProps, {}> {
    render() {
        const { isApprovedUser } = this.props
        return <CreateMapSidebar isApprovedUser={isApprovedUser} />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { ealgis } = state

    return {
        isApprovedUser: ealgis.user !== null && ealgis.user.is_approved,
    }
}

const CreateMapSidebarContainerWrapped = connect<{}, {}, IProps>(mapStateToProps)(CreateMapSidebarContainer)

export default CreateMapSidebarContainerWrapped
