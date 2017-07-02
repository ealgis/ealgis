import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { connect } from "react-redux"
import { Tabs, Tab } from "material-ui/Tabs"
import { GridList, GridTile } from "material-ui/GridList"
import FlatButton from "material-ui/FlatButton"
import MapsLayers from "material-ui/svg-icons/maps/layers"
import { grey500, grey200 } from "material-ui/styles/colors"
import MapCoverImage from "../../map-cover-image/MapCoverImageContainer"
import { IMap, IMapsModule } from "../../../redux/modules/interfaces"

const MapListContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    martin-top: 30,
    padding: 10px;
`

const MapGridList = styled(GridList)`
    overflow-y: auto !important;
    width: 100% !important;
`

const HugeCreateMapButton = styled(FlatButton)`
    width: 100% !important;
    height: 100% !important;
`

const HugeCreateMapIcon = styled(MapsLayers)`
    width: 15% !important;
    height: 15% !important;
    margin-bottom: 25px !important;
`

export interface IProps {
    tabName: string
    userId: number
    maps: IMapsModule
    getMyMaps: Function
    getSharedMaps: Function
    getPublicMaps: Function
}

export class MapList extends React.Component<IProps, {}> {
    render() {
        const { tabName, userId, maps, getMyMaps, getSharedMaps, getPublicMaps } = this.props

        const mapGridTiles = (maps: Array<Array<any>>) =>
            maps.map(([mapId, map]: Array<any>) =>
                <GridTile
                    key={mapId}
                    containerElement={<Link to={`/map/${map.id}/${map["name-url-safe"]}`} />}
                    title={map.name}
                    subtitle={map.owner_user_id == userId ? map.description : `By ${map.owner.username}`}
                    cols={1}
                    titleBackground={"rgba(0, 188, 212, 0.7)"}
                >
                    <MapCoverImage mapDefinition={map as IMap} width={370} height={180} />
                </GridTile>
            )

        return (
            <div>
                <Tabs value={tabName}>
                    {/* START MY MAPS TAB */}
                    <Tab label="My Maps" containerElement={<Link to={"/maps"} />} value="maps">
                        <MapListContainer>
                            <MapGridList cols={4} cellHeight={180} padding={10}>
                                <GridTile
                                    key={"create-new-map"}
                                    containerElement={<Link to={"/new/map/"} />}
                                    title={"Create Map"}
                                    titleBackground={"rgba(0, 188, 212, 0.7)"}
                                    cols={1}
                                >
                                    <HugeCreateMapButton icon={<HugeCreateMapIcon color={grey500} />} />
                                </GridTile>

                                {mapGridTiles(getMyMaps())}
                            </MapGridList>
                        </MapListContainer>
                    </Tab>
                    {/* END MY MAPS TAB */}

                    {/* START SHARED TAB */}
                    <Tab label="Shared" containerElement={<Link to={"/shared"} />} value="shared">
                        <MapListContainer>
                            <MapGridList cols={4} cellHeight={180} padding={10}>
                                {mapGridTiles(getSharedMaps())}
                            </MapGridList>
                        </MapListContainer>
                    </Tab>
                    {/* START SHARED TAB */}

                    {/* START PUBLIC TAB */}
                    {/*<Tab
                    label="Public"
                    containerElement={<Link to={"/public"}/>}
                    value="public"
                >
                    <MapListContainer>
                        <MapGridList
                            cols={4}
                            cellHeight={180}
                            padding={10}
                        >
                            {mapGridTiles(getPublicMaps())}
                        </MapGridList>
                    </MapListContainer>
                </Tab>*/}
                    {/* START PUBLIC TAB */}
                </Tabs>
            </div>
        )
    }
}

export default MapList
