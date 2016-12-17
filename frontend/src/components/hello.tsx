import * as React from "react";
import RaisedButton from 'material-ui/RaisedButton';

export interface HelloProps { compiler: string; framework: string; }

// 'HelloProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
export class Hello extends React.Component<HelloProps, undefined> {
    render() {
        return <div><h1>Hello from {this.props.compiler} and {this.props.framework}!</h1><p><RaisedButton label="Default" /></p></div>;
    }
}
