import * as React from "react";
import { Link } from 'react-router';
import LayerUINav from "./LayerUINavContainer";
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import LayerToggle from './LayerToggleContainer';

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

export interface MapUINavProps {
    defn: any
    onDeleteMap: Function,
}

export class MapUINav extends React.Component<MapUINavProps, undefined> {
    render() {
        const { defn, onDeleteMap } = this.props

        return <div>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <IconButton tooltip="Duplicate this map and use it to create a new map" tooltipPosition="bottom-right"><ContentCopy /></IconButton>
                    <IconButton tooltip="Set the default extents for this map to the current view" tooltipPosition="bottom-right"><ActionBookmark /></IconButton>
                    <IconButton tooltip="Delete this map" tooltipPosition="bottom-right" onClick={onDeleteMap}><ActionDelete /></IconButton>
                </ToolbarGroup>
                <ToolbarGroup lastChild={true}>
                    <IconButton tooltip="Close this map and return to your list of maps" tooltipPosition="bottom-right" containerElement={<Link to={"/"} />}><NavigationClose /></IconButton>
                </ToolbarGroup>
            </Toolbar>
            
            <h2 style={{textAlign: "center"}}>{defn.name}</h2>

            <List>
                <ListItem primaryText="Layers" leftIcon={<MapsLayers />} rightIconButton={<IconButton tooltip="Add a new layer" containerElement={<Link to={`/map/${defn.id}/layer`} />}><MapsAddLocation /></IconButton>} />
                {defn.json.layers.map((l: any, key: number) => 
                    <LayerUINav 
                        key={key}
                        layerId={key}
                        layerDefinition={l}
                        mapId={defn.id}
                    />
                )}
            </List>
        </div>
    }
}

export default MapUINav