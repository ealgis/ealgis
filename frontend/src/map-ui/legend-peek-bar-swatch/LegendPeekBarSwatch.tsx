import * as React from "react"
import styled from "styled-components"
import { IOLStyleDef } from "../../redux/modules/maps";

const FlexboxColumnBase = styled.div`
    height: 15px;
    flex-grow: 1;
`

export interface IProps {
    styleDef: IOLStyleDef
    onMouseEnter: any
    onMouseLeave: any
}

export class LegendPeekBarSwatchNav extends React.Component<IProps, {}> {
    render() {
        const { styleDef, onMouseEnter, onMouseLeave } = this.props
        const FlexboxColumn = styled(FlexboxColumnBase)`
            background-color: rgb(${styleDef.rgb.join(",")});
        `

        return <FlexboxColumn onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
    }
}

export default LegendPeekBarSwatchNav
