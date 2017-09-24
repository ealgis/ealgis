import * as React from "react"
import styled from "styled-components"
import { ITable, IColumn } from "../../redux/modules/interfaces"
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from "material-ui/Card"
import IconButton from "material-ui/IconButton"
import ContentCopy from "material-ui/svg-icons/content/content-copy"

export interface IProps {
    column: IColumn
    table: ITable
}

export class ColumnCard extends React.Component<IProps, {}> {
    render() {
        const { column, table } = this.props

        return (
            <Card>
                <CardHeader title={column["id"]} subtitle={`${column["metadata_json"]["type"]} // ${column["metadata_json"]["kind"]}`} />
                <CardText>{table["metadata_json"]["type"]}</CardText>
            </Card>
        )
    }
}

export default ColumnCard
