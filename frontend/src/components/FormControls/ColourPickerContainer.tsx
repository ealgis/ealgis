import * as React from "react";
import { connect } from 'react-redux';
import ColourPicker from "./ColourPicker";

export interface ColourPickerContainerProps {
    displayColorPicker: boolean,
    input: object,
}

export class ColourPickerContainer extends React.Component<ColourPickerContainerProps, undefined> {
    public static defaultProps = {
        displayColorPicker: false,
        colour: { // Orange
          r: '241',
          g: '112',
          b: '19',
          a: '1',
        },
    }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    if(JSON.stringify(this.props.input.value) !== JSON.stringify(nextProps.input.value)) {
        return true
    }
    return false
  }

    render() {
        const { colour, input } = this.props
        return <ColourPicker colour={input.value} input={input} />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => ({
    
})

const ColourPickerFieldContainerWrapped = connect(
    mapStateToProps
)(ColourPickerContainer as any)

export default ColourPickerFieldContainerWrapped