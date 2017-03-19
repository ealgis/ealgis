import * as React from "react";
import reactCSS from 'reactcss';
import { SwatchesPicker } from 'react-color';

export interface ColourPickerProps {
    input: any,
    displayColorPicker: boolean,
    color: object,
}

class ColourPicker extends React.Component<ColourPickerProps, undefined> {
  state = {
    displayColorPicker: false,
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
    const { input: { onChange } } = this.props
    onChange(color.rgb)
    this.setState({ color: color.rgb })
    this.handleClose()
  };

  constructor(props: any) {
    super(props)
    this.state = {
      color: props.color
    };
  }

  render() {
    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div>
        <div style={ styles.swatch } onClick={ this.handleClick }>
          <div style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SwatchesPicker color={ this.state.color } onChange={ this.handleChange } />
        </div> : null }

      </div>
    )
  }
}

export default ColourPicker