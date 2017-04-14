import * as React from "react";
import { Link } from 'react-router';
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import LayerToggle from './LayerToggleContainer';
import LayerDeleteConfirmDialog from "./LayerDeleteConfirmDialogContainer";

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import MapsEditLocation from 'material-ui/svg-icons/maps/edit-location';
import MapsLayers from 'material-ui/svg-icons/maps/layers';
import MapsAddLocation from 'material-ui/svg-icons/maps/add-location';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ActionBookmark from 'material-ui/svg-icons/action/bookmark';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';

const iconButtonElement = (
  <IconButton
    touch={true}
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);

export interface LayerUINavProps {
    defn: any
    layerId: number,
    mapId: number,
    onCloneLayer: any,
    onDeleteLayer: any,
    deleteConfirmModalId: string,
}

export class LayerUINav extends React.Component<LayerUINavProps, undefined> {
    render() {
        const { defn, layerId, mapId, onCloneLayer, onDeleteLayer, deleteConfirmModalId } = this.props

        return <div>
            <ListItem 
                rightIconButton={
                    <IconMenu iconButtonElement={iconButtonElement}>
                        <MenuItem primaryText="Edit" leftIcon={<MapsEditLocation />} containerElement={<Link to={`/map/${mapId}/layer/${layerId}`} />} />
                        <MenuItem primaryText="Clone" leftIcon={<ContentCopy />} onClick={onCloneLayer} />
                        <MenuItem primaryText="Delete" leftIcon={<ActionDelete />} onClick={onDeleteLayer} />
                    </IconMenu>
                }
                rightToggle={
                    <LayerToggle
                        layerDefinition={defn}
                        layerId={layerId}
                        mapId={mapId}
                    />
                }
            />

            <LayerDeleteConfirmDialog modalId={deleteConfirmModalId} mapId={mapId} layerId={layerId} layerDefinition={defn}></LayerDeleteConfirmDialog>
        </div>
    }
}

export default LayerUINav