import * as React from "react"
import DataTableListByFamily from "./DataTableListByFamily"
import { includes as arrayIncludes } from "core-js/library/fn/array"
import { List } from "material-ui/List"
import Subheader from "material-ui/Subheader"
import { flattenDeep, uniq } from "lodash-es"
import { ISchema, ITableFamily, ITable } from "../../redux/modules/interfaces"

export interface IProps {
    schemas: Array<ISchema>
    tables: Array<ITable>
    favouriteTables: Array<string> // schema_name.table_id
    onClickTable: Function
    onFavouriteTable?: Function
}

export class DataTableListBySchemaAndTopic extends React.PureComponent<IProps, {}> {
    getTablesForTopic(topic_name: string | null, tables: Array<ITable>) {
        if (topic_name !== null) {
            return tables.filter((table: ITable) => "topics" in table.metadata_json && arrayIncludes(table.metadata_json.topics, topic_name)
        } else {
            return tables
        }
    }
    renderTopicHeading(topic_name: string | null, schema: ISchema) {
        if (topic_name !== null) {
            return (
                <Subheader>
                    {topic_name} ({schema.name} - {schema.family})
                </Subheader>
            )
        } else {
            return (
                <Subheader>
                    {schema.name} - {schema.family}
                </Subheader>
            )
        }
    }

    render() {
        const { schemas, tables, favouriteTables, onClickTable, onFavouriteTable } = this.props

        return (
            <List>
                {schemas.map((schema: ISchema) => {
                    const tablesInSchema = tables.filter((table: ITable) => table.schema_name === schema.schema_name)

                    const topicsInSchema = uniq(
                        flattenDeep(
                            tablesInSchema.map((table: ITable) => ("topics" in table.metadata_json ? table.metadata_json.topics : [null]))
                        )
                    )

                    return (
                        <React.Fragment key={schema.schema_name}>
                            {topicsInSchema.map((topic_name: string | null) => {
                                const tablesInTopic = this.getTablesForTopic(topic_name, tablesInSchema)

                                const familiesInTopic = uniq(
                                    flattenDeep(
                                        tablesInTopic.map(
                                            (table: ITable) => ("family" in table.metadata_json ? table.metadata_json.family : null)
                                        )
                                    )
                                )

                                return (
                                    <React.Fragment key={`${schema.schema_name}.${topic_name}`}>
                                        {this.renderTopicHeading(topic_name, schema)}

                                        {familiesInTopic.map((family_name: string) => {
                                            const tablesInFamily = tablesInTopic.filter(
                                                (table: ITable) =>
                                                    "family" in table.metadata_json && table.metadata_json.family === family_name
                                            )

                                            const family: ITableFamily = {
                                                family: family_name,
                                                type: tablesInFamily[0].metadata_json.type,
                                                tables: tablesInFamily,
                                            }

                                            return (
                                                <DataTableListByFamily
                                                    key={`${schema.schema_name}.${topic_name}.${family_name}`}
                                                    family={family}
                                                    favouriteTables={favouriteTables}
                                                    onClickTable={onClickTable}
                                                    onFavouriteTable={onFavouriteTable}
                                                />
                                            )
                                        })}
                                    </React.Fragment>
                                )
                            })}
                        </React.Fragment>
                    )
                })}
            </List>
        )
    }
}

export default DataTableListBySchemaAndTopic
