import * as React from "react";
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import { indigo900, grey100 } from 'material-ui/styles/colors';

const styles = {
  querySummaryTableHeaderColumn: {
      backgroundColor: indigo900,
      color: grey100,
  },
  querySummaryTable: {
      marginTop: "10px",
  },
}

export interface LayerQuerySummaryProps {
    
}

export class LayerQuerySummary extends React.Component<LayerQuerySummaryProps, undefined> {
    render() {
        // const {  } = this.props

        return <Table style={styles.querySummaryTable}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
                <TableRow>
                    <TableHeaderColumn style={styles.querySummaryTableHeaderColumn}>MIN</TableHeaderColumn>
                    <TableHeaderColumn style={styles.querySummaryTableHeaderColumn}>MAX</TableHeaderColumn>
                    <TableHeaderColumn style={styles.querySummaryTableHeaderColumn}>STDEV</TableHeaderColumn>
                </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
                <TableRow>
                    <TableRowColumn>0</TableRowColumn>
                    <TableRowColumn>38,356</TableRowColumn>
                    <TableRowColumn>8,202</TableRowColumn>
                </TableRow>
            </TableBody>
        </Table>
    }
}

export default LayerQuerySummary