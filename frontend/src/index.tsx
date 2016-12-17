import * as React from "react";
import * as ReactDOM from "react-dom";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


import { Hello } from "./components/Hello";

ReactDOM.render(
    <MuiThemeProvider>
        <Hello compiler="TypeScript" framework="React" />
    </MuiThemeProvider>,
    document.getElementById("ealgis")
);
