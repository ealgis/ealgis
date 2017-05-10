import * as React from "react";
import reactCSS from 'reactcss';
import { AlphaPicker } from 'react-color';

export interface ColourPickerProps {
    alpha: number,
    width: string,
    input: any,
}

class ColourPicker extends React.Component<ColourPickerProps, undefined> {
  handleChange = (color: object) => {
    const { input: { onChange } } = this.props
    onChange(color.rgb.a)
  }

  render() {
    const { alpha, width } = this.props
    const rgb = {"r": 0, "g": 0, "b": 0, "a": alpha}

    return <AlphaPicker color={rgb} width={width} onChange={this.handleChange} />
  }
}

export default ColourPicker