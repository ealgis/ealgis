import * as React from "react";
import AppBar from 'material-ui/AppBar';
import Snackbar from 'material-ui/Snackbar';
import { LoginDialog } from './LoginDialog';

export interface EalUISnackbarNotificationProps {
    message: string,
    key: string,
    action: string,
    autoHideDuration: number,
    onActionTouchTap: any,
}

export interface EalUISnackbarProps {
    open: boolean,
    active: EalUISnackbarNotificationProps,
    messages: Array<EalUISnackbarNotificationProps>,
}

export interface EalUIAppProps {
    loading: boolean,
    sidebarOpen: boolean,
    snackbar: EalUISnackbarProps,
}

export interface EalUIProps {
    app: EalUIAppProps,
    user: any,
    sidebar: any,
    content: any,
    onTapAppBarLeft: any,
    handleRequestClose: any,
}

export class EalUI extends React.Component<EalUIProps, undefined> {
    render() {
        const { app, user, content, sidebar, onTapAppBarLeft, handleRequestClose } = this.props

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
            <Snackbar
                open={app.snackbar.open}
                message={app.snackbar.active.message}
                action={app.snackbar.active.action}
                autoHideDuration={app.snackbar.active.autoHideDuration}
                onActionTouchTap={() => app.snackbar.active.onActionTouchTap()}
                onRequestClose={handleRequestClose}
            />
        </div>
    }
}

export default EalUI