import * as React from "react"

const styles = {
    flexboxColumn: {
        height: "15px",
        flexGrow: 1,
    },
}

export interface LegendPeekBarSwatchNavProps {
    styleDef: object
    onMouseEnter: Function
    onMouseLeave: Function
}

export class LegendPeekBarSwatchNav extends React.Component<LegendPeekBarSwatchNavProps, undefined> {
    render() {
        const { styleDef, onMouseEnter, onMouseLeave } = this.props
        const columnStyle = Object.assign(styles.flexboxColumn, { backgroundColor: `rgb(${styleDef.rgb.join(",")})` })

        return <div style={columnStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
    }
}

export default LegendPeekBarSwatchNav
