import * as React from "react"
import { connect } from "react-redux"
import ExpressionPartSelector from "./ExpressionPartSelector"
import { setActiveContentComponent } from "../../redux/modules/app"
import { startBrowsing } from "../../redux/modules/databrowser"
import { IStore, eEalUIComponent } from "../../redux/modules/interfaces"

export interface IProps {
    componentId: eEalUIComponent
    field: string
    open: any
    anchorEl: any
    handleRequestClose: Function
    onFieldChange: Function
    showCreateGroup?: boolean
    showValueSpecial?: boolean
    showNumericalInput?: boolean
    showRelatedColumns?: boolean
}

export interface IDispatchProps {
    activateDataBrowser: Function
}

export class ExpressionPartSelectorContainer extends React.Component<IProps & IDispatchProps, {}> {
    render() {
        const {
            componentId,
            field,
            open,
            anchorEl,
            handleRequestClose,
            onFieldChange,
            activateDataBrowser,
            showCreateGroup,
            showValueSpecial,
            showNumericalInput,
            showRelatedColumns,
        } = this.props

        if (
            open === true &&
            showCreateGroup === false &&
            showValueSpecial === false &&
            showNumericalInput === false &&
            showRelatedColumns === false
        ) {
            activateDataBrowser(field)
            return null
        } else {
            return (
                <ExpressionPartSelector
                    open={open}
                    anchorEl={anchorEl}
                    handleRequestClose={handleRequestClose}
                    onFieldChange={onFieldChange}
                    onOpenDataBrowser={() => {
                        activateDataBrowser(field, componentId)
                    }}
                    showCreateGroup={showCreateGroup === undefined ? true : showCreateGroup}
                    showValueSpecial={showValueSpecial === undefined ? true : showValueSpecial}
                    showNumericalInput={showNumericalInput === undefined ? true : showNumericalInput}
                    showRelatedColumns={showRelatedColumns === undefined ? true : showRelatedColumns}
                />
            )
        }
    }
}

const mapStateToProps = (state: IStore): {} => {
    const { maps, ealgis, databrowser } = state

    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        activateDataBrowser: (message: string, componentId: eEalUIComponent) => {
            dispatch(setActiveContentComponent(eEalUIComponent.DATA_BROWSER))
            dispatch(startBrowsing(componentId, message))
        },
    }
}

const ExpressionPartSelectorContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(ExpressionPartSelectorContainer)

export default ExpressionPartSelectorContainerWrapped
