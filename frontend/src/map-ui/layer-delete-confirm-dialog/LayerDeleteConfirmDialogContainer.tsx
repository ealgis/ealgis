import * as React from "react"
import { connect } from "react-redux"
import LayerDeleteConfirmDialog from "./components/LayerDeleteConfirmDialog"
import { toggleModalState } from "../../actions"
import { deleteMapLayer } from "../../redux/modules/maps"

interface LayerDeleteConfirmDialogContainerRouteParams {
    id: Number
}

export interface LayerDeleteConfirmDialogContainerProps {
    modalId: string
    open: boolean

    onClose: Function
    onConfirm: Function

    mapId: number
    map: object
    layerId: number
    layerDefinition: object
}

export class LayerDeleteConfirmDialogContainer extends React.Component<
    LayerDeleteConfirmDialogContainerProps,
    undefined
> {
    public static defaultProps: Partial<LayerDeleteConfirmDialogContainerProps> = {
        open: false,
    }

    render() {
        const { modalId, open, onClose, onConfirm, map, layerId, layerDefinition } = this.props

        return (
            <LayerDeleteConfirmDialog
                open={open}
                onClose={() => onClose(modalId)}
                onConfirm={() => onConfirm(modalId, map, layerId)}
                layerDefinition={layerDefinition}
            />
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps, app } = state

    return {
        open: app.dialogs[ownProps.modalId],
        map: maps[ownProps.mapId],
        layerId: ownProps.layerId,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        onClose: (modalId: string) => {
            dispatch(toggleModalState(modalId))
        },
        onConfirm: (modalId: string, map: object, layerId: number) => {
            dispatch(toggleModalState(modalId))
            dispatch(deleteMapLayer(map, layerId))
        },
    }
}

const LayerDeleteConfirmDialogContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(
    LayerDeleteConfirmDialogContainer as any
)

export default LayerDeleteConfirmDialogContainerWrapped
