import Divider from "material-ui/Divider"
import IconButton from "material-ui/IconButton"
import IconMenu from "material-ui/IconMenu"
import { ListItem } from "material-ui/List"
import MenuItem from "material-ui/MenuItem"
import Toggle from "material-ui/Toggle"
import ActionDelete from "material-ui/svg-icons/action/delete"
import ContentCopy from "material-ui/svg-icons/content/content-copy"
import MapsEditLocation from "material-ui/svg-icons/maps/edit-location"
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"
import * as React from "react"
import { Link } from "react-router"
import styled from "styled-components"
import { ILayer, IMUIThemePalette } from "../../redux/modules/interfaces"
import LayerDeleteConfirmDialog from "../layer-delete-confirm-dialog/LayerDeleteConfirmDialogContainer"
import LegendPeekBar from "../legend-peek-bar/LegendPeekBarContainer"

const Description = styled.span`
    display: block;
`

const LegendPeekBarListItem = styled(ListItem)`
    padding-left: 0px !important;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
    margin-left: 17px !important;
`

const LayerToggle = styled(Toggle)`
    margin-right: 35px !important;
`

const LayerName = styled.div`
    max-width: 80%;
`

const styles: any = {
    layerListItemWithLegend: {
        paddingBottom: "0px",
    },
}

export interface IProps {
    muiThemePalette: IMUIThemePalette
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
            muiThemePalette,
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

        const iconButtonElement = (
            <IconButton touch={true}>
                <MoreVertIcon color={muiThemePalette.accent2Color} />
            </IconButton>
        )

        let legendPeekProps: any = {}
        if ("olStyleDef" in defn && defn["olStyleDef"] !== undefined) {
            legendPeekProps.open = true
            legendPeekProps.style = styles.layerListItemWithLegend
            legendPeekProps.nestedItems = [
                <LegendPeekBarListItem
                    key={`legendpeek-${mapId}-${layerId}`}
                    primaryText={<LegendPeekBar mapId={mapId} layerId={layerId} olStyleDef={defn.olStyleDef!} />}
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
            <React.Fragment>
                <ListItem
                    primaryText={<LayerName>{defn.name}</LayerName>}
                    secondaryText={
                        <p>
                            {getGeometryDescription(defn)}
                            {defn.description.length > 0 && <Description>{defn.description}</Description>}
                        </p>
                    }
                    secondaryTextLines={defn.description.length > 0 ? 2 : 1}
                    {...mapOwnerProps}
                    rightToggle={
                        <LayerToggle
                            toggled={defn.visible}
                            onToggle={onToggleVisibility}
                            thumbStyle={{ backgroundColor: muiThemePalette.borderColor }}
                        />
                    }
                    {...legendPeekProps}
                />
                <Divider />

                <LayerDeleteConfirmDialog modalId={deleteConfirmModalId} mapId={mapId} layerId={layerId} layerDefinition={defn} />
            </React.Fragment>
        )
    }
}

export default LayerUINav
