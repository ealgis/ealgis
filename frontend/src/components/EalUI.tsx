import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';

export interface EalUIProps { }

export class EalUI extends React.Component<EalUIProps, undefined> {
    render() {
        return <MuiThemeProvider>
            <div><RaisedButton label="Default" /></div>
        </MuiThemeProvider>;
    }
}
