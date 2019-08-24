import * as React from "react"
import styled from "styled-components"

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import IconButton from "material-ui/IconButton"
import ContentCopy from "material-ui/svg-icons/content/content-copy"

import { indigo900, grey100 } from "material-ui/styles/colors"
import { ILayerQuerySummary } from "../../redux/modules/layerquerysummary";

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
    justify-content: center;
    align-items: center;
`

const FirstFlexboxColumn = styled.div`
    flex-grow: 1;
`

const SecondFlexboxColumn = styled.div`
    padding: 8px;
`

const StyledTable = styled(Table)`
    margin-top: 10px;
`

const StyledTableHeaderColumn = styled(TableHeaderColumn)`
    background-color: ${indigo900} !important;
    color: ${grey100} !important;
`

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
            <FlexboxContainer>
                <FirstFlexboxColumn>
                    <StyledTable>
                        <TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
                            <TableRow>
                                <StyledTableHeaderColumn>MIN</StyledTableHeaderColumn>
                                <StyledTableHeaderColumn>MAX</StyledTableHeaderColumn>
                                <StyledTableHeaderColumn>STDEV</StyledTableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false}>
                            <TableRow>
                                <TableRowColumn>{stats.min}</TableRowColumn>
                                <TableRowColumn>{stats.max}</TableRowColumn>
                                <TableRowColumn>{stats.stddev}</TableRowColumn>
                            </TableRow>
                        </TableBody>
                    </StyledTable>
                </FirstFlexboxColumn>

                <SecondFlexboxColumn>
                    <IconButton
                        tooltip="Apply scale settings to layer"
                        tooltipPosition={"bottom-left"}
                        onClick={onFitScaleToData}
                    >
                        <ContentCopy />
                    </IconButton>
                </SecondFlexboxColumn>
            </FlexboxContainer>
        )
    }
}

export default LayerQuerySummary
