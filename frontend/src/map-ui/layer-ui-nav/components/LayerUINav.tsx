import * as React from "react"
import { Link } from "react-router"
import LegendPeekBar from "../../legend-peek-bar/LegendPeekBarContainer"
import Paper from "material-ui/Paper"
import Toggle from "material-ui/Toggle"
import Subheader from "material-ui/Subheader"
import { List, ListItem } from "material-ui/List"
import RaisedButton from "material-ui/RaisedButton"
import NavigationClose from "material-ui/svg-icons/navigation/close"
import LayerDeleteConfirmDialog from "../../layer-delete-confirm-dialog/LayerDeleteConfirmDialogContainer"
import { IMap, ILayer } from "../../../redux/modules/interfaces"

import IconMenu from "material-ui/IconMenu"
import IconButton from "material-ui/IconButton"
import MenuItem from "material-ui/MenuItem"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"

import MapsEditLocation from "material-ui/svg-icons/maps/edit-location"
import MapsLayers from "material-ui/svg-icons/maps/layers"
import MapsAddLocation from "material-ui/svg-icons/maps/add-location"
import ActionDelete from "material-ui/svg-icons/action/delete"
import ActionBookmark from "material-ui/svg-icons/action/bookmark"
import ContentCopy from "material-ui/svg-icons/content/content-copy"
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"

import { grey400, darkBlack, lightBlack } from "material-ui/styles/colors"

const styles = {
    paperListItem: {
        margin: "7px",
    },
    layerListItemWithLegend: {
        paddingBottom: "0px",
    },
    legendPeekBar: {
        paddingLeft: "0px",
        paddingTop: "0px",
        paddingBottom: "0px",
        marginLeft: "17px",
    },
    layerToggle: {
        marginRight: 35,
    },
}

const iconButtonElement = (
    <IconButton touch={true}>
        <MoreVertIcon color={grey400} />
    </IconButton>
)

export interface IProps {
    // Props
    defn: ILayer
    layerId: number
    mapId: number
    isMapOwner: boolean
    mapNameURLSafe: string
    onCloneLayer: any
    onDeleteLayer: any
    onToggleVisibility: any
    deleteConfirmModalId: string
    getGeometryDescription: Function
}

export class LayerUINav extends React.Component<IProps, {}> {
    render() {
        const {
            defn,
            layerId,
            mapId,
            isMapOwner,
            mapNameURLSafe,
            onCloneLayer,
            onDeleteLayer,
            onToggleVisibility,
            deleteConfirmModalId,
            getGeometryDescription,
        } = this.props

        let legendPeekProps: any = {}
        if ("olStyleDef" in defn) {
            legendPeekProps.open = true
            legendPeekProps.style = styles.layerListItemWithLegend
            legendPeekProps.nestedItems = [
                <ListItem
                    key={`legendpeek-${mapId}-${layerId}`}
                    style={styles.legendPeekBar}
                    primaryText={<LegendPeekBar mapId={mapId} layerId={layerId} olStyleDef={defn.olStyleDef} />}
                    disabled={true}
                />,
            ]
        }

        let mapOwnerProps: any = {}
        if (isMapOwner) {
            mapOwnerProps.rightIconButton = (
                <IconMenu iconButtonElement={iconButtonElement}>
                    <MenuItem
                        primaryText="Edit"
                        leftIcon={<MapsEditLocation />}
                        containerElement={<Link to={`/map/${mapId}/${mapNameURLSafe}/layer/${layerId}`} />}
                    />
                    <MenuItem primaryText="Clone" leftIcon={<ContentCopy />} onClick={onCloneLayer} />
                    <MenuItem primaryText="Delete" leftIcon={<ActionDelete />} onClick={onDeleteLayer} />
                </IconMenu>
            )
        }

        return (
            <Paper style={styles.paperListItem} zDepth={1}>
                <ListItem
                    primaryText={defn.name}
                    secondaryText={
                        <p>
                            {getGeometryDescription(defn)}<br />
                            {defn.description}
                        </p>
                    }
                    secondaryTextLines={2}
                    {...mapOwnerProps}
                    rightToggle={
                        <Toggle toggled={defn.visible} onToggle={onToggleVisibility} style={styles.layerToggle} />
                    }
                    {...legendPeekProps}
                />

                <LayerDeleteConfirmDialog
                    modalId={deleteConfirmModalId}
                    mapId={mapId}
                    layerId={layerId}
                    layerDefinition={defn}
                />
            </Paper>
        )
    }
}

export default LayerUINav
