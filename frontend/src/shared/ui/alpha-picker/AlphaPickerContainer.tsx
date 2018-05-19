import * as React from "react"
import AlphaPicker from "./AlphaPicker"

export interface IProps {
    input: any
    width: string
}

export default class AlphaPickerContainer extends React.Component<IProps, {}> {
    public static defaultProps = {
        width: "100%",
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (this.props.input.value !== nextProps.input.value) {
            return true
        }
        return false
    }

    render() {
        const { width, input } = this.props

        // @ts-ignore
        return <AlphaPicker alpha={input.value} width={width} input={input} />
    }
}

// const mapStateToProps = (state: any) => ({})

// const AlphaPickerFieldContainerWrapped = connect<{}, {}, IProps, {}>(mapStateToProps)(AlphaPickerContainer)

// export default AlphaPickerContainer
