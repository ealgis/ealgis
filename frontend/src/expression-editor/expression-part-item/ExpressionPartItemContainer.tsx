import * as React from "react"
import { connect } from "react-redux"
import ExpressionPartItem from "./ExpressionPartItem"
import { setActiveContentComponent } from "../../redux/modules/app"
import { startBrowsing } from "../../redux/modules/databrowser"
import { IStore, ITableInfo, eEalUIComponent } from "../../redux/modules/interfaces"

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
    constructor(props: IProps & IDispatchProps) {
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
    const { maps, ealgis, databrowser } = state

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

const ExpressionPartItemContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(ExpressionPartItemContainer)

export default ExpressionPartItemContainerWrapped
