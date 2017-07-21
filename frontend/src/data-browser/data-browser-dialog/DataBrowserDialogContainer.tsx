import * as React from "react"
import { connect } from "react-redux"
import DataBrowserDialog from "./DataBrowserDialog"
import { toggleModalState } from "../../redux/modules/app"
import { IStore, ISchemaInfo, ISchema } from "../../redux/modules/interfaces"

interface IProps {}

export interface IStoreProps {
    // From Props
    schemainfo: ISchemaInfo
    dataBrowserModalOpen: boolean
}

export interface IDispatchProps {
    onToggleDataBrowserModalState: Function
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

interface IState {
    selectedSchemas: Array<string>
}

export class DataBrowserDialogContainer extends React.Component<
    IProps & IStoreProps & IDispatchProps & IRouteProps,
    IState
> {
    constructor(props: IStoreProps & IDispatchProps) {
        super(props)
        this.state = { selectedSchemas: [] }
    }

    handleSchemaChange(menuItemValue: Array<string>) {
        this.setState({ selectedSchemas: menuItemValue })
    }

    handleClickSchema(schema: ISchema) {
        this.setState({ selectedSchemas: [...this.state.selectedSchemas, schema.name] })
    }

    render() {
        const { schemainfo, dataBrowserModalOpen, onToggleDataBrowserModalState } = this.props
        const { selectedSchemas } = this.state

        return (
            <DataBrowserDialog
                schemainfo={schemainfo}
                selectedSchemas={selectedSchemas}
                handleSchemaChange={(menuItemValue: Array<string>) => {
                    this.handleSchemaChange(menuItemValue)
                }}
                handleClickSchema={(schema: ISchema) => {
                    this.handleClickSchema(schema)
                }}
                dataBrowserModalOpen={dataBrowserModalOpen}
                onToggleDataBrowserModalState={() => onToggleDataBrowserModalState()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { ealgis } = state
    return { schemainfo: ealgis.schemainfo, dataBrowserModalOpen: true }
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
