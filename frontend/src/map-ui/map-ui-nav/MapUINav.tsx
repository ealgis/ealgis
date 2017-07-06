import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import LayerUINav from "../layer-ui-nav/LayerUINavContainer"
import Subheader from "material-ui/Subheader"
import { Tabs, Tab } from "material-ui/Tabs"
import { List, ListItem } from "material-ui/List"
import Dialog from "material-ui/Dialog"
import RaisedButton from "material-ui/RaisedButton"
import Checkbox from "material-ui/Checkbox"
import FlatButton from "material-ui/FlatButton"
import NavigationClose from "material-ui/svg-icons/navigation/close"
import Divider from "material-ui/Divider"
import DataInspector from "../data-inspector/DataInspector"
import * as CopyToClipboard from "react-copy-to-clipboard"
import { IMap, IMUIThemePalette } from "../../redux/modules/interfaces"
import { white } from "material-ui/styles/colors"

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

const MapName = styled.h3`
    font-weight: bold;
    color: ${white};
    padding-left: 20px;
`

const TabContainer = styled.div`margin: 0px;`

const DownloadButton = styled(RaisedButton)`
    margin: 12px !important;
`

const IncludeGeomCheckbox = styled(Checkbox)`
    margin: 12px !important;
`

const SharingDescription = styled.div`
    overflow: visible;
    margin-bottom: 10px;
`

const styles: React.CSSProperties = {
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
}

export interface IProps {
    muiThemePalette: IMUIThemePalette
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
            muiThemePalette,
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
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <MapName>
                            {defn.name}
                        </MapName>
                    </ToolbarGroup>
                    <ToolbarGroup lastChild={true}>
                        <IconMenu
                            iconButtonElement={
                                <IconButton touch={true}>
                                    <MoreVertIcon color={white} />
                                </IconButton>
                            }
                        >
                            {isOwner &&
                                <MenuItem
                                    primaryText="Add Layer"
                                    leftIcon={<MapsAddLocation />}
                                    onClick={onAddLayer}
                                />}
                            {isOwner &&
                                <MenuItem
                                    primaryText="Edit Map"
                                    leftIcon={<ModeEdit />}
                                    containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/edit`} />}
                                />}
                            <MenuItem primaryText="Duplicate Map" leftIcon={<ContentCopy />} onClick={onDuplicateMap} />
                            <MenuItem primaryText="Reset Position" leftIcon={<ActionHome />} onClick={onResetOrigin} />
                            {isOwner &&
                                <MenuItem
                                    primaryText="Delete Map"
                                    leftIcon={<ActionDelete />}
                                    onClick={onToggleDeleteModalState}
                                />}
                        </IconMenu>

                        <IconButton
                            tooltip="Close this map and return to your list of maps"
                            tooltipPosition="bottom-right"
                            containerElement={<Link to={"/maps"} />}
                        >
                            <NavigationClose color={white} />
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>

                <Tabs value={tabName} tabItemContainerStyle={{ backgroundColor: muiThemePalette.accent3Color }}>
                    {/* START LAYERS TAB */}
                    <Tab
                        label="LAYERS"
                        containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}`} />}
                        value={""}
                    >
                        <TabContainer>
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
                        </TabContainer>
                    </Tab>
                    {/* END LAYERS TAB */}

                    {/* START DATA TAB */}
                    <Tab
                        label="DATA"
                        containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/data`} />}
                        value={"data"}
                    >
                        <TabContainer>
                            <Subheader>Download Data</Subheader>

                            <DownloadButton
                                label="Whole Map"
                                secondary={true}
                                icon={<FileFileDownload />}
                                onClick={onExportWholeMap}
                            />
                            <DownloadButton
                                label="Map Viewport"
                                secondary={true}
                                icon={<FileFileDownload />}
                                onClick={onExportMapViewport}
                            />

                            <IncludeGeomCheckbox
                                checkedIcon={<ImageGridOn />}
                                uncheckedIcon={<ImageGridOff />}
                                label="Include extra attributes from the geometry source"
                                onCheck={onCheckIncludeGeomAttrs}
                            />

                            <Divider />

                            <DataInspector />
                        </TabContainer>
                    </Tab>
                    {/* END DATA TAB */}

                    {/* START SETTINGS TAB */}
                    {isOwner &&
                        <Tab
                            label="SETTINGS"
                            containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/settings`} />}
                            value={"settings"}
                        >
                            <TabContainer>
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
                                            (
                                                <ListItem
                                                    primaryText="Private"
                                                    secondaryText={
                                                        <SharingDescription>
                                                            Your map is not shared with anyone - only you can see it.
                                                        </SharingDescription>
                                                    }
                                                    secondaryTextLines={2}
                                                />
                                            ) as any
                                        }
                                        checkedIcon={<ActionLock />}
                                        uncheckedIcon={<ActionLock />}
                                        style={defn.shared === 1 ? styles.radioButtonSelected : styles.radioButton}
                                    />

                                    <RadioButton
                                        value={2}
                                        iconStyle={styles.radioButtonIconStyle}
                                        label={
                                            (
                                                <ListItem
                                                    primaryText="Shared"
                                                    secondaryText={
                                                        <SharingDescription>
                                                            Your map is shared with everyone in the EALGIS community.
                                                            They can view the map or make a copy for themselves.
                                                        </SharingDescription>
                                                    }
                                                    secondaryTextLines={2}
                                                />
                                            ) as any
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
                            </TabContainer>
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
