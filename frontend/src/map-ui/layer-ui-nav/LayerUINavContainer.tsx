import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import LayerUINav from "./components/LayerUINav"
import { toggleModalState } from "../../redux/modules/app"
import { cloneMapLayer, changeLayerVisibility } from "../../redux/modules/maps"
import { IStore, IMap, ILayer, IGeomInfo } from "../../redux/modules/interfaces"

export interface IProps {
    // Props
    // key: number
    layerId: number
    layerDefinition: ILayer
    mapId: number
    isMapOwner: boolean
    mapNameURLSafe: string
    // From Store
    mapDefinition: IMap
    geominfo: IGeomInfo
    // From Dispatch to Props
    onCloneLayer: Function
    onDeleteLayer: Function
    onToggleVisibility: Function
}

export class LayerUINavContainer extends React.Component<IProps, {}> {
    private getGeometryDescription(layer: ILayer, geominfo: IGeomInfo) {
        return geominfo[layer["schema"] + "." + layer["geometry"]].description
    }

    render() {
        const {
            mapId,
            mapDefinition,
            layerDefinition,
            isMapOwner,
            mapNameURLSafe,
            layerId,
            onCloneLayer,
            onDeleteLayer,
            onToggleVisibility,
            geominfo,
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
                onToggleVisibility={() => onToggleVisibility(mapDefinition, layerId)}
                deleteConfirmModalId={deleteConfirmModalId}
                getGeometryDescription={(layer: ILayer) => this.getGeometryDescription(layer, geominfo)}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps) => {
    const { maps, ealgis } = state

    return {
        mapDefinition: maps[ownProps.mapId],
        geominfo: ealgis.geominfo,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onCloneLayer: (mapId: number, layerId: number) => {
            dispatch(cloneMapLayer(mapId, layerId))
        },
        onDeleteLayer: (modalId: string) => {
            dispatch(toggleModalState(modalId))
        },
        onToggleVisibility: (map: IMap, layerId: number) => {
            dispatch(changeLayerVisibility(map, layerId))
        },
    }
}

const LayerUINavContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(LayerUINavContainer as any)

export default LayerUINavContainerWrapped
