import * as React from "react"
import { ILayerQuerySummary } from "../../../redux/modules/interfaces"

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import IconButton from "material-ui/IconButton"
import ContentCopy from "material-ui/svg-icons/content/content-copy"

import { indigo900, grey100 } from "material-ui/styles/colors"

const styles: React.CSSProperties = {
    querySummaryTableHeaderColumn: {
        backgroundColor: indigo900,
        color: grey100,
    },
    querySummaryTable: {
        marginTop: "10px",
    },
    // FIXME What is the proper way to do CSS styling in JSX? -> ReactCSS
    flexboxContainer: {
        display: "-ms-flex",
        display: "-webkit-flex",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    flexboxFirstColumn: {
        flexGrow: "1",
        // "marginRight": "20px",
    },
    flexboxSecondColumn: {
        padding: "8px",
    },
}

export interface IProps {
    stats: ILayerQuerySummary
    onFitScaleToData: any
}

export class LayerQuerySummary extends React.Component<IProps, {}> {
    render() {
        const { stats, onFitScaleToData } = this.props

        stats.min = parseFloat(stats.min.toFixed(3))
        stats.max = parseFloat(stats.max.toFixed(3))
        stats.stddev = parseFloat(stats.stddev.toFixed(3))

        return (
            <div style={styles.flexboxContainer}>
                <div style={styles.flexboxFirstColumn}>
                    <Table style={styles.querySummaryTable}>
                        <TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
                            <TableRow>
                                <TableHeaderColumn style={styles.querySummaryTableHeaderColumn}>MIN</TableHeaderColumn>
                                <TableHeaderColumn style={styles.querySummaryTableHeaderColumn}>MAX</TableHeaderColumn>
                                <TableHeaderColumn style={styles.querySummaryTableHeaderColumn}>
                                    STDEV
                                </TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false}>
                            <TableRow>
                                <TableRowColumn>{stats.min}</TableRowColumn>
                                <TableRowColumn>{stats.max}</TableRowColumn>
                                <TableRowColumn>{stats.stddev}</TableRowColumn>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div style={styles.flexboxSecondColumn}>
                    <IconButton
                        tooltip="Apply scale settings to layer"
                        tooltipPosition={"bottom-left"}
                        onTouchTap={onFitScaleToData}
                    >
                        <ContentCopy />
                    </IconButton>
                </div>
            </div>
        )
    }
}

export default LayerQuerySummary
