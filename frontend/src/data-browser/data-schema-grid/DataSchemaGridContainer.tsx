import * as React from "react"
import { connect } from "react-redux"
import DataSchemaGrid from "./DataSchemaGrid"
import { groupBy } from "lodash-es"
import { toggleModalState } from "../../redux/modules/app"
import { IStore, ISchemaInfo, ISchema } from "../../redux/modules/interfaces"

interface IProps {
    handleClickSchema: Function
    handleClickSchemaMoreInfo: Function
}

export interface IStoreProps {
    // From Props
    schemainfo: ISchemaInfo
}

export interface IDispatchProps {}

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

const DataSchemaGridContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(DataSchemaGridContainer)

export default DataSchemaGridContainerWrapped
