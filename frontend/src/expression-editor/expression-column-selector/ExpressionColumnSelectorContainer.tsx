import { groupBy } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import ExpressionColumnSelector from "./ExpressionColumnSelector"
import { eEalUIComponent } from "../../redux/modules/app";
import { IColumn, ITableInfo, ISchemaInfo } from "../../redux/modules/ealgis";
import { IStore } from "../../redux/modules/reducer";

export interface IProps {
    componentId: eEalUIComponent
    field: string
    columns: Array<IColumn>
    onActivateDataBrowser: Function
    onRemoveColumn: Function
}

export interface IDispatchProps {}

export interface IStoreProps {
    tableinfo: ITableInfo
    schemainfo: ISchemaInfo
}

export class ExpressionColumnSelectorContainer extends React.PureComponent<IProps & IDispatchProps & IStoreProps, {}> {
    render() {
        const { componentId, columns, field, onActivateDataBrowser, onRemoveColumn, tableinfo, schemainfo } = this.props

        const columnsByTable = groupBy(columns, (column: IColumn) => `${column.schema_name}.${column.table_info_id}`)

        return (
            <ExpressionColumnSelector
                columnsByTable={columnsByTable}
                schemainfo={schemainfo}
                tableinfo={tableinfo}
                field={field}
                onOpenDataBrowser={() => {
                    onActivateDataBrowser(field, componentId)
                }}
                onRemoveColumn={onRemoveColumn}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { ealgis } = state

    return { tableinfo: ealgis.tableinfo, schemainfo: ealgis.schemainfo }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(ExpressionColumnSelectorContainer)
