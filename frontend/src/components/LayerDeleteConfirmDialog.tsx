import * as React from "react"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"

export interface LayerDeleteConfirmDialogProps {
    open: boolean
    onClose: any
    onConfirm: any
    layerDefinition: object
}

export class LayerDeleteConfirmDialog extends React.Component<LayerDeleteConfirmDialogProps, undefined> {
    render() {
        const { open, onClose, onConfirm, layerDefinition } = this.props

        const actions = [
            <FlatButton label="No" primary={true} onTouchTap={onClose} />,
            <FlatButton label="Yes" primary={true} onTouchTap={onConfirm} />,
        ]

        return (
            <Dialog title={`Layer '${layerDefinition.name}'`} actions={actions} modal={true} open={open}>
                Would you like to delete this layer?
            </Dialog>
        )
    }
}

export default LayerDeleteConfirmDialog
