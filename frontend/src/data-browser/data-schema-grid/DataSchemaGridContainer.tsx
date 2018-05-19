import { groupBy } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import { ISchema, ISchemaInfo, IStore } from "../../redux/modules/interfaces"
import DataSchemaGrid from "./DataSchemaGrid"

interface IProps {
    handleClickSchema: Function
}

export interface IStoreProps {
    // From Props
    schemainfo: ISchemaInfo
}

export interface IDispatchProps {
    handleClickSchemaMoreInfo: Function
}

interface IOwnProps {}

export class DataSchemaGridContainer extends React.Component<IProps & IStoreProps & IDispatchProps, {}> {
    render() {
        const { schemainfo, handleClickSchema, handleClickSchemaMoreInfo } = this.props

        const schemasByFamily = groupBy(schemainfo, (schema: ISchema) => schema.family)

        return (
            <DataSchemaGrid
                schemasByFamily={schemasByFamily}
                handleClickSchema={handleClickSchema}
                handleClickSchemaMoreInfo={handleClickSchemaMoreInfo}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: any): IStoreProps => {
    const { ealgis } = state

    return {
        schemainfo: ealgis.schemainfo,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        handleClickSchemaMoreInfo(schema: ISchema) {
            window.open(schema.description)
        },
    }
}

const DataSchemaGridContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    DataSchemaGridContainer
)

export default DataSchemaGridContainerWrapped
