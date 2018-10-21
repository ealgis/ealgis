import Checkbox from "material-ui/Checkbox";
import Dialog from "material-ui/Dialog";
import Divider from "material-ui/Divider";
import FlatButton from "material-ui/FlatButton";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import { List, ListItem } from "material-ui/List";
import MenuItem from "material-ui/MenuItem";
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";
import RaisedButton from "material-ui/RaisedButton";
import { white } from "material-ui/styles/colors";
import Subheader from "material-ui/Subheader";
import { ActionBookmarkBorder, ActionDelete, ActionHome, ActionLock, ActionLockOpen, ContentAddBox, ContentContentCopy, ContentLink, EditorModeEdit, FileCloudDownload, FileFileDownload, MapsAddLocation, NavigationClose, NavigationMoreVert } from "material-ui/svg-icons";
import { Tab, Tabs } from "material-ui/Tabs";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { Link } from "react-router";
import styled from "styled-components";
import { IMap, IMUIThemePalette } from "../../redux/modules/interfaces";
import DataInspector from "../data-inspector/DataInspector";
import LayerUINav from "../layer-ui-nav/LayerUINavContainer";

const MapName = styled.h3`
    font-weight: normal;
    color: ${white};
    padding-left: 20px;
`

const TabContainer = styled.div`
    margin: 0px;
`

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

const styles: any = {
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
    isLoggedIn: boolean
    onDuplicateMap: any
    onDownloadMap: any
    onAddLayer: any
    onSetOrigin: any
    onChangeSharing: any
    onResetOrigin: any
    onDeleteMap: any
    onToggleDeleteModalState: any
    deleteModalOpen: boolean
    onExportWholeMap: any
    onExportMapViewport: any
    onGetShareableLink: any
}

export class MapUINav extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            tabName,
            defn,
            isOwner,
            isLoggedIn,
            onDuplicateMap,
            onDownloadMap,
            onAddLayer,
            onSetOrigin,
            onResetOrigin,
            onChangeSharing,
            onDeleteMap,
            onToggleDeleteModalState,
            deleteModalOpen,
            onExportWholeMap,
            onExportMapViewport,
            onGetShareableLink,
        } = this.props

        const deleteMapActions = [
            <FlatButton label="Close" primary={true} onClick={onToggleDeleteModalState} />,
            <FlatButton label="Yes" primary={true} onClick={onDeleteMap} />,
        ]

        return (
            <React.Fragment>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <MapName>{defn.name}</MapName>
                    </ToolbarGroup>
                    <ToolbarGroup lastChild={true}>
                        <IconMenu
                            iconButtonElement={
                                <IconButton touch={true}>
                                    <NavigationMoreVert color={white} />
                                </IconButton>
                            }
                        >
                            {isOwner && <MenuItem primaryText="Add Layer" leftIcon={<MapsAddLocation />} onClick={onAddLayer} />}
                            {isOwner && (
                                <MenuItem
                                    primaryText="Edit Map"
                                    leftIcon={<EditorModeEdit />}
                                    containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/edit`} />}
                                />
                            )}
                            {isLoggedIn && (
                                <React.Fragment>
                                    <MenuItem primaryText="Duplicate Map" leftIcon={<ContentContentCopy />} onClick={onDuplicateMap} />
                                    <MenuItem primaryText="Download Map" leftIcon={<FileCloudDownload />} onClick={onDownloadMap} />
                                </React.Fragment>
                            )}
                            <MenuItem primaryText="Reset Position" leftIcon={<ActionHome />} onClick={onResetOrigin} />
                            {isOwner && (
                                <MenuItem primaryText="Delete Map" leftIcon={<ActionDelete />} onClick={onToggleDeleteModalState} />
                            )}
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
                    <Tab label="LAYERS" containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}`} />} value={""}>
                        <TabContainer>
                            <List>
                                {defn.json.layers.map((l: any, key: number) => (
                                    <LayerUINav
                                        key={key}
                                        layerId={key}
                                        layerDefinition={l}
                                        mapId={defn.id}
                                        isMapOwner={isOwner}
                                        mapNameURLSafe={defn["name-url-safe"]}
                                    />
                                ))}
                            </List>

                            {isOwner && (
                                <FlatButton
                                    key={"add-layer-button"}
                                    label="Add Layer"
                                    primary={true}
                                    icon={<ContentAddBox />}
                                    fullWidth={true}
                                    onClick={onAddLayer}
                                    style={{ marginBottom: 20 }}
                                />
                            )}
                        </TabContainer>
                    </Tab>
                    {/* END LAYERS TAB */}

                    {/* START DATA TAB */}
                    <Tab label="DATA" containerElement={<Link to={`/map/${defn.id}/${defn["name-url-safe"]}/data`} />} value={"data"}>
                        <TabContainer>
                            <Subheader>Download Data</Subheader>

                            <DownloadButton label="Whole Map" primary={true} icon={<FileFileDownload />} onClick={onExportWholeMap} />
                            <DownloadButton label="Map Viewport" primary={true} icon={<FileFileDownload />} onClick={onExportMapViewport} />

                            <Divider />

                            <DataInspector />
                        </TabContainer>
                    </Tab>
                    {/* END DATA TAB */}

                    {/* START SETTINGS TAB */}
                    {isOwner && (
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

                                <RadioButtonGroup name="shared" defaultSelected={defn.shared} onChange={onChangeSharing}>
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
                                                            Your map is shared with everyone in the EALGIS community. They can view the map
                                                            or make a copy for themselves.
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
                        </Tab>
                    )}
                    {/* END SETTINGS TAB */}
                </Tabs>

                <Dialog title="Delete Map" actions={deleteMapActions} modal={true} open={deleteModalOpen}>
                    Are you sure you want to delete this map?
                </Dialog>
            </React.Fragment>
        )
    }
}

export default MapUINav
