import * as React from "react";
import { connect } from 'react-redux';
import ColourPicker from "./ColourPicker";

const mapStateToProps = (state: any) => ({
    
})

const ColourPickerFieldContainerWrapped = connect(
    mapStateToProps
)(ColourPicker)

ColourPicker.defaultProps = {
    displayColorPicker: false,
    color: { // Default colour = orange
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    },
};

export default ColourPickerFieldContainerWrapped