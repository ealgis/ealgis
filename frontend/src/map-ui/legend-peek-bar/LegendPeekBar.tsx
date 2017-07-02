import * as React from "react"
import styled from "styled-components"
import LegendPeekBarSwatch from "../legend-peek-bar-swatch/LegendPeekBarSwatchContainer"
import { IOLStyleDef } from "../../redux/modules/interfaces"

const PeerBarContainer = styled.div`
    position: relative;
`

const LabelText = styled.div`
    height: 16px
    padding-top: 4px;
    padding-bottom: 4px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.3);
`

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
    flex-direction: row;
`

export interface IProps {
    layerId: number
    olStyleDef: Array<IOLStyleDef>
    handleMouseEnter: Function
    handleMouseLeave: Function
    labelText: string
}

export class LegendPeekBarNav extends React.Component<IProps, {}> {
    render() {
        const { layerId, olStyleDef, handleMouseEnter, handleMouseLeave, labelText } = this.props

        return (
            <PeerBarContainer>
                <LabelText>{labelText || "Legend"}</LabelText>
                <FlexboxContainer>
                    {olStyleDef.map((styleDef: IOLStyleDef, key: number) => {
                        return (
                            <LegendPeekBarSwatch
                                key={key}
                                styleDef={styleDef}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            />
                        )
                    })}
                </FlexboxContainer>
            </PeerBarContainer>
        )
    }
}

export default LegendPeekBarNav
