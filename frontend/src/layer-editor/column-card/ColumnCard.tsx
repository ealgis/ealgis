import * as React from "react"
import styled from "styled-components"
import { ITable, IColumn } from "../../redux/modules/interfaces"
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"
import IconButton from "material-ui/IconButton"
import ContentCopy from "material-ui/svg-icons/content/content-copy"

const StyledCard = styled(Card)`margin-bottom: 10px;`

const TableNotes = styled.div`padding-bottom: 10px;`

const MetadataURL = styled.div`line-height: 20px;`

export interface IProps {
    column: IColumn
    table: ITable
    onRemoveColumn: any
}

export class ColumnCard extends React.Component<IProps, {}> {
    render() {
        const { column, table, onRemoveColumn } = this.props

        return (
            <StyledCard
                onExpandChange={(newExpandedState: boolean) => {
                    console.log("onExpandChange", newExpandedState)
                }}
            >
                <CardHeader
                    title={column["name"].toUpperCase()}
                    subtitle={`${column["metadata_json"]["type"]} // ${column["metadata_json"]["kind"]}`}
                    actAsExpander={true}
                    showExpandableButton={true}
                />
                <CardTitle title={table["metadata_json"]["family"].toUpperCase()} subtitle={table["metadata_json"]["type"]} />
                <CardText expandable={true}>
                    <TableNotes dangerouslySetInnerHTML={{ __html: table["metadata_json"]["notes"] }} />
                    {table["metadata_json"]["metadataUrls"].map((obj: any, key: any) => (
                        <MetadataURL key={key}>
                            <a href={obj["url"]} target="_blank">
                                {obj["name"]}
                            </a>
                        </MetadataURL>
                    ))}
                </CardText>
                <CardActions>
                    <FlatButton label="Remove" onClick={onRemoveColumn} />
                </CardActions>
            </StyledCard>
        )
    }
}

export default ColumnCard
