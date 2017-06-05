import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import LayerUINav from "./LayerUINav"
import { cloneMapLayer, toggleModalState } from "../actions"

interface LayerUINavContainerRouteParams {
    id: Number
}

export interface LayerUINavContainerProps {
    layerDefinition: LayerUINavContainerRouteParams
    mapId: number
    isMapOwner: boolean
    mapNameURLSafe: string
    mapDefinition: object
    layerId: number
    onCloneLayer: Function
    onDeleteLayer: Function
    datainfo: object
}

export class LayerUINavContainer extends React.Component<LayerUINavContainerProps, undefined> {
    private getGeometryDescription(defn: object, datainfo) {
        return datainfo[defn["schema"] + "." + defn["geometry"]].description
    }

    render() {
        const {
            layerDefinition,
            mapId,
            isMapOwner,
            mapNameURLSafe,
            layerId,
            onCloneLayer,
            onDeleteLayer,
            datainfo,
        } = this.props
        const deleteConfirmModalId = "LayerDeleteConfirmDialog_" + mapId + "_" + layerId

        return (
            <LayerUINav
                defn={layerDefinition}
                layerId={layerId}
                mapId={mapId}
                isMapOwner={isMapOwner}
                mapNameURLSafe={mapNameURLSafe}
                onCloneLayer={() => onCloneLayer(mapId, layerId)}
                onDeleteLayer={() => onDeleteLayer(deleteConfirmModalId)}
                deleteConfirmModalId={deleteConfirmModalId}
                getGeometryDescription={(defn: object) => this.getGeometryDescription(defn, datainfo)}
            />
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps, datainfo } = state
    return {
        layerDefinition: ownProps.layerDefinition,
        mapId: ownProps.mapId,
        datainfo: datainfo,
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        onCloneLayer: (mapId: number, layerId: number) => {
            dispatch(cloneMapLayer(mapId, layerId))
        },
        onDeleteLayer: (modalId: string) => {
            dispatch(toggleModalState(modalId))
        },
    }
}

const LayerUINavContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(LayerUINavContainer as any)

export default LayerUINavContainerWrapped
