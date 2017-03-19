import * as React from "react";
import { connect } from 'react-redux';
import ColourPicker from "./ColourPicker";

export interface ColourPickerContainerProps {
    displayColorPicker: boolean,
    color: object,
}

export class ColourPickerContainer extends React.Component<ColourPickerContainerProps, undefined> {
    public static defaultProps = {
        displayColorPicker: false,
        color: { // Default colour = orange
          r: '241',
          g: '112',
          b: '19',
          a: '1',
        },
    }

    render() {
        const { displayColorPicker, color, input } = this.props
        return <ColourPicker displayColorPicker={displayColorPicker} color={color} input={input} />;
    }
}

const mapStateToProps = (state: any) => ({
    
})

const ColourPickerFieldContainerWrapped = connect(
    mapStateToProps
)(ColourPickerContainer)

export default ColourPickerFieldContainerWrapped