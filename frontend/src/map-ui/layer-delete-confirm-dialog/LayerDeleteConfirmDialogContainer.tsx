import * as React from "react"
import { connect } from "react-redux"
import LayerDeleteConfirmDialog from "./components/LayerDeleteConfirmDialog"
import { toggleModalState } from "../../redux/modules/app"
import { deleteMapLayer } from "../../redux/modules/maps"
import { IStore, IMap, ILayer } from "../../redux/modules/interfaces"

export interface IProps {
    modalId: string
    mapId: number
    layerId: number
    layerDefinition: ILayer
}

export interface IStoreProps {
    open: boolean
    map: IMap
}

export interface IDispatchProps {
    onClose: Function
    onConfirm: Function
}

export class LayerDeleteConfirmDialogContainer extends React.Component<IProps & IStoreProps & IDispatchProps, {}> {
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

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { maps, app } = state

    return {
        open: app.modals.get(ownProps.modalId) || false,
        map: maps[ownProps.mapId],
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onClose: (modalId: string) => {
            dispatch(toggleModalState(modalId))
        },
        onConfirm: (modalId: string, map: IMap, layerId: number) => {
            dispatch(toggleModalState(modalId))
            dispatch(deleteMapLayer(map, layerId))
        },
    }
}

const LayerDeleteConfirmDialogContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(
    LayerDeleteConfirmDialogContainer
)

export default LayerDeleteConfirmDialogContainerWrapped
