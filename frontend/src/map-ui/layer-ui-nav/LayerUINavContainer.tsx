import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import LayerUINav from "./LayerUINav"
import { toggleModalState } from "../../redux/modules/app"
import { cloneMapLayer, changeLayerVisibility } from "../../redux/modules/maps"
import { IStore, IMap, ILayer, IGeomInfo, IMUITheme, IMUIThemePalette } from "../../redux/modules/interfaces"
import muiThemeable from "material-ui/styles/muiThemeable"

export interface IProps {
    // key: number
    layerId: number
    layerDefinition: ILayer
    mapId: number
    isMapOwner: boolean
    mapNameURLSafe: string
}

export interface IStateProps {
    mapDefinition: IMap
    geominfo: IGeomInfo
    muiThemePalette: IMUIThemePalette
}

export interface IDispatchProps {
    onCloneLayer: Function
    onDeleteLayer: Function
    onToggleVisibility: Function
}

interface IOwnProps {
    mapId: number
    muiTheme: IMUITheme
}

export class LayerUINavContainer extends React.Component<IProps & IStateProps & IDispatchProps, {}> {
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
            muiThemePalette,
        } = this.props
        const deleteConfirmModalId = "LayerDeleteConfirmDialog_" + mapId + "_" + layerId

        return (
            <LayerUINav
                muiThemePalette={muiThemePalette}
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

const mapStateToProps = (state: IStore, ownProps: any): IStateProps => {
    const { maps, ealgis } = state

    return {
        mapDefinition: maps[ownProps.mapId],
        geominfo: ealgis.geominfo,
        muiThemePalette: ownProps.muiTheme.palette,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
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

const LayerUINavContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(LayerUINavContainer)

export default muiThemeable()(LayerUINavContainerWrapped)
