import * as React from "react"
import LegendPeekBarSwatch from "../../legend-peek-bar-swatch/LegendPeekBarSwatchContainer"
import { IOLStyleDef } from "../../../redux/modules/interfaces"

const styles = {
    peekBarContainer: {
        position: "relative",
    },
    flexContainer: {
        display: "-ms-flex",
        display: "-webkit-flex",
        display: "flex",
        WebkitFlexDirection: "row",
        flexDirection: "row",
    },
    labelText: {
        height: "16px",
        paddingTop: "4px",
        paddingBottom: "4px",
        fontSize: "12px",
        color: "rgba(0, 0, 0, 0.3)",
    },
}

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
            <div style={styles.peekBarContainer}>
                <div style={styles.labelText}>{labelText || "Legend"}</div>
                <div style={styles.flexContainer}>
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
                </div>
            </div>
        )
    }
}

export default LegendPeekBarNav
