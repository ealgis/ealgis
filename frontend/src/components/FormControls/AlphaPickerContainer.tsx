import * as React from "react";
import { connect } from 'react-redux';
import AlphaPicker from "./AlphaPicker";

export interface AlphaPickerContainerProps {
    rgb: object,
    width: string,
}

export class AlphaPickerContainer extends React.Component<AlphaPickerContainerProps, undefined> {
    public static defaultProps = {
        displayPicker: false,
        rgb: {"r": 0, "g": 0, "b": 0, "a": 0.5},
        width: "100%",
    }

    render() {
        const { rgb, width, input } = this.props
        
        return <AlphaPicker {...this.props} />;
    }
}

const mapStateToProps = (state: any) => ({
    
})

const AlphaPickerFieldContainerWrapped = connect(
    mapStateToProps
)(AlphaPickerContainer)

export default AlphaPickerFieldContainerWrapped