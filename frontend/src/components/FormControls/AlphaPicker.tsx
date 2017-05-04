import * as React from "react";
import reactCSS from 'reactcss';
import { AlphaPicker } from 'react-color';

export interface ColourPickerProps {
    input: any,
    rgb: object,
    width: string,
}

class ColourPicker extends React.Component<ColourPickerProps, undefined> {
  handleChange = (newValue) => {
    const { input: { onChange } } = this.props
    onChange(newValue.rgb.a)
    this.setState({ rgb: newValue.rgb })
  };

  constructor(props: any) {
    super(props)
    this.state = {
      rgb: props.rgb
    };
  }

  render() {
    const { rgb, width } = this.props

    return <AlphaPicker color={this.state.rgb} width={width} onChange={this.handleChange} />
  }
}

export default ColourPicker