import * as React from "react"
import { connect } from "react-redux"
import { setActiveContentComponent, eEalUIComponent } from "../../redux/modules/app"
import { startBrowsing } from "../../redux/modules/databrowser"
import ExpressionPartItem from "./ExpressionPartItem"
import { ITableInfo } from "../../redux/modules/ealgis";
import { IStore } from "../../redux/modules/reducer";

export interface IProps {
    componentId: eEalUIComponent
    value: any
    field: string
    showCreateGroup: boolean
    showValueSpecial: boolean
    showNumericalInput: boolean
    showRelatedColumns: boolean
    onFieldChange: Function
}

export interface IDispatchProps {
    activateDataBrowser: Function
}

export interface IStoreProps {
    tableinfo: ITableInfo
}

export interface IState {
    open: boolean
}

export class ExpressionPartItemContainer extends React.Component<IProps & IDispatchProps & IStoreProps, IState> {
    constructor(props: IProps & IDispatchProps & IStoreProps) {
        super(props)
        this.state = { open: false }
    }

    toggleNestedListOpen() {
        this.setState({ open: !this.state.open })
    }

    render() {
        const {
            componentId,
            value,
            field,
            showCreateGroup,
            showValueSpecial,
            showNumericalInput,
            showRelatedColumns,
            onFieldChange,
            tableinfo,
            activateDataBrowser,
        } = this.props

        return (
            <ExpressionPartItem
                value={value}
                open={this.state.open}
                field={field}
                showCreateGroup={showCreateGroup === undefined ? true : showCreateGroup}
                showValueSpecial={showValueSpecial === undefined ? true : showValueSpecial}
                showNumericalInput={showNumericalInput === undefined ? true : showNumericalInput}
                showRelatedColumns={showRelatedColumns === undefined ? true : showRelatedColumns}
                tableinfo={tableinfo}
                onClick={() => {
                    this.toggleNestedListOpen()
                    if (
                        showCreateGroup === false &&
                        showValueSpecial === false &&
                        showNumericalInput === false &&
                        showRelatedColumns === false
                    ) {
                        activateDataBrowser(field, componentId)
                    }
                }}
                onFieldChange={(payload: any) => {
                    this.toggleNestedListOpen()
                    onFieldChange(payload)
                }}
                onOpenDataBrowser={() => {
                    this.toggleNestedListOpen()
                    activateDataBrowser(field, componentId)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { ealgis } = state

    return { tableinfo: ealgis.tableinfo }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        activateDataBrowser: (message: string, componentId: eEalUIComponent) => {
            dispatch(setActiveContentComponent(eEalUIComponent.DATA_BROWSER))
            dispatch(startBrowsing(componentId, message))
        },
    }
}

const ExpressionPartItemContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    ExpressionPartItemContainer
)

export default ExpressionPartItemContainerWrapped
