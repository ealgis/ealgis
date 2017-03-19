import * as React from "react";
import AppBar from 'material-ui/AppBar';
import { LoginDialog } from './LoginDialog';

export interface EalUIProps {
    app: object,
    user: any,
    sidebar: any,
    content: any,
    onTapAppBarLeft: any,
}

export class EalUI extends React.Component<EalUIProps, undefined> {
    render() {
        const { app, user, content, sidebar, onTapAppBarLeft } = this.props

        return <div className="page">
            <div className="page-header">
                <AppBar title={user.username} onLeftIconButtonTouchTap={onTapAppBarLeft} />
            </div>
            <div className="page-content" style={{"display": app.sidebarOpen ? "flex" : "block"}}>
                <LoginDialog open={user.url === null} />
                <main className="page-main-content">
                    {content || this.props.children}
                </main>
                <nav className="page-nav" style={{"display": app.sidebarOpen ? "" : "none"}}>
                    {sidebar || <div></div>}
                </nav>
            </div>
        </div>
    }
}

export default EalUI