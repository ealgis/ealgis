import * as React from "react"
import styled from "styled-components"
import { ColourScale, RGB } from "../../shared/openlayers/colour_scale"

const BarContainer = styled.div`
    position: relative;
`

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
    flex-direction: row;
`

const FlexboxColumnBase = styled.div`
    height: 15px;
    flex-grow: 1;
`

export interface IProps {
    colourName: string
    colourScale: ColourScale
    opacity: number
}

export class ColourScaleBar extends React.PureComponent<IProps, {}> {
    render() {
        const { colourName, colourScale, opacity } = this.props

        return (
            <BarContainer>
                {colourName}
                <FlexboxContainer>
                    {colourScale.interpolated.map((value: RGB, key: number) => {
                        const FlexboxColumn = FlexboxColumnBase.extend`
                            background-color: rgba(${value.r * 255}, ${value.g * 255}, ${value.b * 255}, ${opacity});
                        `
                        return <FlexboxColumn key={key} />
                    })}
                </FlexboxContainer>
            </BarContainer>
        )
    }
}

export default ColourScaleBar
