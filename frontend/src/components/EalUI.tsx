import * as React from "react";
import AppBar from 'material-ui/AppBar';
import { LoginDialog } from './LoginDialog';

export interface EalUIProps {
    user: any,
    sidebar: any,
    content: any,
}

export class EalUI extends React.Component<EalUIProps, undefined> {
    render() {
        const { user, content, sidebar } = this.props

        return <div className="page">
            <div className="page-header">
                <AppBar title={user.username} />
            </div>
            <div className="page-content">
                <LoginDialog open={user.url === null} />
                <main className="page-main-content">
                    {content || this.props.children}
                </main>
                <nav className="page-nav">
                    {sidebar || <div></div>}
                </nav>
            </div>
        </div>
    }
}

export default EalUI