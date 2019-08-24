import * as React from "react"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import { ILayer } from "../../redux/modules/maps";

export interface IProps {
    open: boolean
    onClose: any
    onConfirm: any
    layerDefinition: ILayer
}

export class LayerDeleteConfirmDialog extends React.Component<IProps, {}> {
    render() {
        const { open, onClose, onConfirm, layerDefinition } = this.props

        const actions = [
            <FlatButton label="No" primary={true} onClick={onClose} />,
            <FlatButton label="Yes" primary={true} onClick={onConfirm} />,
        ]

        return (
            <Dialog title={`Layer '${layerDefinition.name}'`} actions={actions} modal={true} open={open}>
                Would you like to delete this layer?
            </Dialog>
        )
    }
}

export default LayerDeleteConfirmDialog
