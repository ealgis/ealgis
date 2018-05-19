import { groupBy } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import { setActiveContentComponent } from "../../redux/modules/app"
import { startBrowsing } from "../../redux/modules/databrowser"
import { IColumn, IDataBrowserConfig, ISchemaInfo, IStore, ITableInfo, eEalUIComponent } from "../../redux/modules/interfaces"
import ExpressionColumnSelector from "./ExpressionColumnSelector"

export interface IProps {
    componentId: eEalUIComponent
    field: string
    columns: Array<IColumn>
    onRemoveColumn: Function
}

export interface IDispatchProps {
    activateDataBrowser: Function
}

export interface IStoreProps {
    tableinfo: ITableInfo
    schemainfo: ISchemaInfo
}

export class ExpressionColumnSelectorContainer extends React.PureComponent<IProps & IDispatchProps & IStoreProps, {}> {
    render() {
        const { componentId, columns, field, onRemoveColumn, tableinfo, schemainfo, activateDataBrowser } = this.props

        const columnsByTable = groupBy(columns, (column: IColumn) => `${column.schema_name}.${column.table_info_id}`)

        return (
            <ExpressionColumnSelector
                columnsByTable={columnsByTable}
                schemainfo={schemainfo}
                tableinfo={tableinfo}
                onOpenDataBrowser={() => {
                    activateDataBrowser(field, componentId, columns)
                }}
                onRemoveColumn={onRemoveColumn}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { maps, ealgis, databrowser } = state

    return { tableinfo: ealgis.tableinfo, schemainfo: ealgis.schemainfo }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        activateDataBrowser: (message: string, componentId: eEalUIComponent, columns: Array<IColumn>) => {
            dispatch(setActiveContentComponent(eEalUIComponent.DATA_BROWSER))
            const config: IDataBrowserConfig = { showColumnNames: false, closeOnFinish: false }
            dispatch(startBrowsing(componentId, message, config, columns))
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(ExpressionColumnSelectorContainer)
