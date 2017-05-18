import * as React from "react";
import { Link } from 'react-router';
import LayerUINav from "./LayerUINavContainer";
import Subheader from 'material-ui/Subheader';
import {Tabs, Tab} from 'material-ui/Tabs';
import { List, ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
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
import ActionHome from 'material-ui/svg-icons/action/home';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import InsertChart from 'material-ui/svg-icons/editor/insert-chart';

import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';

const styles = {
    mapName: {
        textAlign: "center",
    },
    tabBody: {
        margin: "10px",
    },
}

export interface MapUINavProps {
    tabName: string,
    defn: any,
    isOwner: boolean,
    onAddLayer: Function,
    onDuplicateMap: Function,
    onSetOrigin: Function,
    onResetOrigin: Function,
    onDeleteMap: Function,
    onToggleDeleteModalState: Function,
    deleteModalOpen: boolean,
    dataInspector: Array<any>,
}

export class MapUINav extends React.Component<MapUINavProps, undefined> {
    render() {
        const { tabName, defn, isOwner, onAddLayer, onDuplicateMap, onSetOrigin, onResetOrigin, onDeleteMap, onToggleDeleteModalState, deleteModalOpen, dataInspector } = this.props

        const deleteMapActions = [
            <FlatButton
                label="Close"
                primary={true}
                onTouchTap={onToggleDeleteModalState}
            />,
            <FlatButton
                label="Yes"
                primary={true}
                onTouchTap={onDeleteMap}
            />,
        ]

        return <div>
            <h2 style={styles.mapName}>{defn.name}</h2>

            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    {isOwner &&
                        <IconButton tooltip="Add a new layer" tooltipPosition="bottom-right" onClick={onAddLayer}><MapsAddLocation /></IconButton>
                        <IconButton tooltip="Edit the name and description of your map" tooltipPosition="bottom-right" containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/edit`} />}><ModeEdit /></IconButton>
                    }
                    <IconButton tooltip="Duplicate this map and use it to create a new map" tooltipPosition="bottom-right" onClick={onDuplicateMap}><ContentCopy /></IconButton>
                    {isOwner &&
                        <IconButton tooltip="Set the default position for this map to the current view" tooltipPosition="bottom-right" onClick={onSetOrigin}><ActionBookmark /></IconButton>
                    }
                    <IconButton tooltip="Reset the position of this map to its default view" tooltipPosition="bottom-right" onClick={onResetOrigin}><ActionHome /></IconButton>
                    {isOwner &&
                        <IconButton tooltip="Delete this map" tooltipPosition="bottom-right" onClick={onToggleDeleteModalState}><ActionDelete /></IconButton>
                    }
                </ToolbarGroup>
                <ToolbarGroup lastChild={true}>
                    <IconButton tooltip="Close this map and return to your list of maps" tooltipPosition="bottom-right" containerElement={<Link to={"/"} />}><NavigationClose /></IconButton>
                </ToolbarGroup>
            </Toolbar>

            <Tabs
                value={tabName}
            >
                {/* START LAYERS TAB */}
                <Tab
                    label="LAYERS"
                    containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}`}/>}
                    value={""}
                >
                    <div style={styles.tabBody}>
                        <List>
                            {defn.json.layers.map((l: any, key: number) => 
                                <LayerUINav 
                                    key={key}
                                    layerId={key}
                                    layerDefinition={l}
                                    mapId={defn.id}
                                    isMapOwner={isOwner}
                                    mapNameURLSafe={defn["name-url-safe"]}
                                />
                            )}
                        </List>
                    </div>
                </Tab>
                {/* END LAYERS TAB */}

                {/* START DATA INSPECTOR TAB */}
                <Tab
                    label="DATA INSPECTOR"
                    containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/data`}/>}
                    value={"data"}
                >
                    <div style={styles.tabBody}>
                        <List>
                            <ListItem primaryText="Data Inspector" leftIcon={<InsertChart />} disabled={true} />
                            {dataInspector.map((row: any, key: number) =>
                                <ListItem
                                    key={key}
                                    primaryText={row.name}
                                    leftIcon={<MapsLayers />}
                                    initiallyOpen={true}
                                    primaryTogglesNestedList={true}
                                    nestedItems={row.properties.map((propRow: any, key: any) =>
                                        <ListItem
                                            key={key}
                                            primaryText={propRow.value.toString()}
                                            secondaryText={propRow.name}
                                        />
                                    )}
                                />
                            )}
                        </List>
                    </div>
                </Tab>
                {/* END DATA INSPECTOR TAB */}

                {/* START SETTINGS TAB */}
                {isOwner && <Tab
                    label="SETTINGS"
                    containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/settings`}/>}
                    value={"settings"}
                >
                    <div style={styles.tabBody}>

                    </div>
                </Tab>}
                {/* END SETTINGS TAB */}
            </Tabs>

            <Dialog
                title="Delete Map"
                actions={deleteMapActions}
                modal={true}
                open={deleteModalOpen}
            >
                Are you sure you want to delete this map?
            </Dialog>
        </div>
    }
}

export default MapUINav