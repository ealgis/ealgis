import * as React from "react"
import { Link } from "react-router"
import LayerUINav from "../../layer-ui-nav/LayerUINavContainer"
import Subheader from "material-ui/Subheader"
import { Tabs, Tab } from "material-ui/Tabs"
import { List, ListItem } from "material-ui/List"
import Dialog from "material-ui/Dialog"
import RaisedButton from "material-ui/RaisedButton"
import Checkbox from "material-ui/Checkbox"
import FlatButton from "material-ui/FlatButton"
import NavigationClose from "material-ui/svg-icons/navigation/close"
import Divider from "material-ui/Divider"
import DataInspector from "../../data-inspector/DataInspector"
import * as CopyToClipboard from "react-copy-to-clipboard"
import { IMap } from "../../../redux/modules/interfaces"

import IconMenu from "material-ui/IconMenu"
import IconButton from "material-ui/IconButton"
import MenuItem from "material-ui/MenuItem"
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar"
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton"

import MapsEditLocation from "material-ui/svg-icons/maps/edit-location"
import MapsAddLocation from "material-ui/svg-icons/maps/add-location"
import ActionDelete from "material-ui/svg-icons/action/delete"
import ActionBookmarkBorder from "material-ui/svg-icons/action/bookmark-border"
import ActionHome from "material-ui/svg-icons/action/home"
import ActionLock from "material-ui/svg-icons/action/lock"
import ActionLockOpen from "material-ui/svg-icons/action/lock-open"
import ImageGridOn from "material-ui/svg-icons/image/grid-on"
import ImageGridOff from "material-ui/svg-icons/image/grid-off"
import SocialPublic from "material-ui/svg-icons/social/public"
import ContentCopy from "material-ui/svg-icons/content/content-copy"
import ContentLink from "material-ui/svg-icons/content/link"
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"
import ModeEdit from "material-ui/svg-icons/editor/mode-edit"
import FileFileDownload from "material-ui/svg-icons/file/file-download"

const styles = {
    mapName: {
        textAlign: "center",
    },
    tabBody: {
        margin: "10px",
    },
    downloadButton: {
        margin: "12px",
    },
    includeGeomAttrsCheckbox: {
        margin: "12px",
    },
    radioButton: {
        marginBottom: "0px",
    },
    radioButtonSelected: {
        marginBottom: "0px",
    },
    radioButtonIconStyle: {
        paddingLeft: "8px",
        paddingRight: "12px",
        paddingTop: "16px",
    },
    radioButtonSecondaryText: {
        overflow: "visible",
        marginBottom: "10px",
    },
}

export interface IProps {
    tabName: string
    defn: IMap
    isOwner: boolean
    onDuplicateMap: any
    onAddLayer: any
    onSetOrigin: any
    onChangeSharing: any
    onResetOrigin: any
    onDeleteMap: any
    onToggleDeleteModalState: any
    deleteModalOpen: boolean
    onExportWholeMap: any
    onExportMapViewport: any
    onCheckIncludeGeomAttrs: any
    onGetShareableLink: any
}

export class MapUINav extends React.Component<IProps, {}> {
    render() {
        const {
            tabName,
            defn,
            isOwner,
            onDuplicateMap,
            onAddLayer,
            onSetOrigin,
            onResetOrigin,
            onChangeSharing,
            onDeleteMap,
            onToggleDeleteModalState,
            deleteModalOpen,
            onExportWholeMap,
            onExportMapViewport,
            onCheckIncludeGeomAttrs,
            onGetShareableLink,
        } = this.props

        const deleteMapActions = [
            <FlatButton label="Close" primary={true} onTouchTap={onToggleDeleteModalState} />,
            <FlatButton label="Yes" primary={true} onTouchTap={onDeleteMap} />,
        ]

        return (
            <div>
                <h2 style={styles.mapName}>{defn.name}</h2>

                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        {isOwner &&
                            <IconButton tooltip="Add a new layer" tooltipPosition="bottom-right" onClick={onAddLayer}>
                                <MapsAddLocation />
                            </IconButton>}
                        {isOwner &&
                            <IconButton
                                tooltip="Edit the name and description of your map"
                                tooltipPosition="bottom-right"
                                containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/edit`} />}
                            >
                                <ModeEdit />
                            </IconButton>}
                        <IconButton
                            tooltip="Duplicate this map and use it to create a new map"
                            tooltipPosition="bottom-right"
                            onClick={onDuplicateMap}
                        >
                            <ContentCopy />
                        </IconButton>
                        <IconButton
                            tooltip="Reset the position of this map to its default view"
                            tooltipPosition="bottom-right"
                            onClick={onResetOrigin}
                        >
                            <ActionHome />
                        </IconButton>
                        {isOwner &&
                            <IconButton
                                tooltip="Delete this map"
                                tooltipPosition="bottom-right"
                                onClick={onToggleDeleteModalState}
                            >
                                <ActionDelete />
                            </IconButton>}
                    </ToolbarGroup>
                    <ToolbarGroup lastChild={true}>
                        <IconButton
                            tooltip="Close this map and return to your list of maps"
                            tooltipPosition="bottom-right"
                            containerElement={<Link to={"/maps"} />}
                        >
                            <NavigationClose />
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>

                <Tabs value={tabName}>
                    {/* START LAYERS TAB */}
                    <Tab
                        label="LAYERS"
                        containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}`} />}
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

                    {/* START DATA TAB */}
                    <Tab
                        label="DATA"
                        containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/data`} />}
                        value={"data"}
                    >
                        <div style={styles.tabBody}>
                            <Subheader>Download Data</Subheader>

                            <RaisedButton
                                label="Whole Map"
                                secondary={true}
                                style={styles.downloadButton}
                                icon={<FileFileDownload />}
                                onClick={onExportWholeMap}
                            />
                            <RaisedButton
                                label="Map Viewport"
                                secondary={true}
                                style={styles.downloadButton}
                                icon={<FileFileDownload />}
                                onClick={onExportMapViewport}
                            />

                            <Checkbox
                                checkedIcon={<ImageGridOn />}
                                uncheckedIcon={<ImageGridOff />}
                                label="Include extra attributes from the geometry source"
                                style={styles.includeGeomAttrsCheckbox}
                                onCheck={onCheckIncludeGeomAttrs}
                            />

                            <Divider />

                            <DataInspector />
                        </div>
                    </Tab>
                    {/* END DATA TAB */}

                    {/* START SETTINGS TAB */}
                    {isOwner &&
                        <Tab
                            label="SETTINGS"
                            containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/settings`} />}
                            value={"settings"}
                        >
                            <div style={styles.tabBody}>
                                <Subheader>Map</Subheader>

                                <ListItem
                                    primaryText="Map starting position"
                                    secondaryText="Set the default position for this map to the current view."
                                    secondaryTextLines={2}
                                    leftIcon={<ActionBookmarkBorder style={styles.radioButtonIconStyle} />}
                                    onClick={onSetOrigin}
                                />

                                <Subheader>Sharing</Subheader>

                                <CopyToClipboard
                                    text={`${window.location.origin}/map/${defn.id}/${defn["name-url-safe"]}?shared=1`}
                                    onCopy={onGetShareableLink}
                                >
                                    <FlatButton label="Get Shareable Link" icon={<ContentLink />} />
                                </CopyToClipboard>

                                <RadioButtonGroup
                                    name="shared"
                                    defaultSelected={defn.shared}
                                    onChange={onChangeSharing}
                                >
                                    <RadioButton
                                        value={1}
                                        iconStyle={styles.radioButtonIconStyle}
                                        label={
                                            <ListItem
                                                primaryText="Private"
                                                secondaryText={
                                                    <div style={styles.radioButtonSecondaryText}>
                                                        Your map is not shared with anyone - only you can see it.
                                                    </div>
                                                }
                                                secondaryTextLines={2}
                                            />
                                        }
                                        checkedIcon={<ActionLock />}
                                        uncheckedIcon={<ActionLock />}
                                        style={defn.shared === 1 ? styles.radioButtonSelected : styles.radioButton}
                                    />

                                    <RadioButton
                                        value={2}
                                        iconStyle={styles.radioButtonIconStyle}
                                        label={
                                            <ListItem
                                                primaryText="Shared"
                                                secondaryText={
                                                    <div style={styles.radioButtonSecondaryText}>
                                                        Your map is shared with everyone in the EALGIS community. They
                                                        can view the map or make a copy for themselves.
                                                    </div>
                                                }
                                                secondaryTextLines={2}
                                            />
                                        }
                                        checkedIcon={<ActionLockOpen />}
                                        uncheckedIcon={<ActionLockOpen />}
                                        style={defn.shared === 2 ? styles.radioButtonSelected : styles.radioButton}
                                    />

                                    {/*<RadioButton
                                value={3}
                                iconStyle={styles.radioButtonIconStyle}
                                label={<ListItem
                                    primaryText="Public"
                                    secondaryText={<div style={styles.radioButtonSecondaryText}>
                                        Your map is shared with the public - anyone can view the map without being logged in.
                                    </div>}
                                    secondaryTextLines={2}
                                />}
                                checkedIcon={<SocialPublic />}
                                uncheckedIcon={<SocialPublic />}
                                style={(defn.shared === 3) ? styles.radioButtonSelected : styles.radioButton}
                            />*/}
                                </RadioButtonGroup>
                            </div>
                        </Tab>}
                    {/* END SETTINGS TAB */}
                </Tabs>

                <Dialog title="Delete Map" actions={deleteMapActions} modal={true} open={deleteModalOpen}>
                    Are you sure you want to delete this map?
                </Dialog>
            </div>
        )
    }
}

export default MapUINav