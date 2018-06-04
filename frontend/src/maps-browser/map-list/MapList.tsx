import { GridList, GridTile } from "material-ui/GridList"
import { Tab, Tabs } from "material-ui/Tabs"
import * as React from "react"
import { Link } from "react-router"
import styled from "styled-components"
import { IMUIThemePalette, IMap, IMapsModule } from "../../redux/modules/interfaces"
import MapCoverImage from "../map-cover-image/MapCoverImageContainer"

const MapListContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-top: 30;
    padding: 10px;
`

const MapGridList = styled(GridList)`
    overflow-y: auto !important;
    width: 100% !important;
`

export interface IProps {
    muiThemePalette: IMUIThemePalette
    tabName: string
    userId: number | null
    maps: IMapsModule
    getMyMaps: Function
    getSharedMaps: Function
    getPublicMaps: Function
}

export class MapList extends React.Component<IProps, {}> {
    render() {
        const { tabName, userId, maps, getMyMaps, getSharedMaps, getPublicMaps, muiThemePalette } = this.props

        const mapGridTiles = (maps: Array<Array<any>>) =>
            maps.map(([mapId, map]: Array<any>) => (
                <GridTile
                    key={mapId}
                    containerElement={<Link to={`/map/${map.id}/${map["name-url-safe"]}`} />}
                    title={map.name}
                    subtitle={userId !== null && map.owner_user_id == userId ? map.description : `By ${map.owner.username}`}
                    titleBackground={muiThemePalette.accent1Color}
                    cols={1}
                >
                    <MapCoverImage mapDefinition={map as IMap} width={370} height={180} />
                </GridTile>
            ))

        return (
            <div>
                {userId !== null && (
                    <Tabs value={tabName} tabItemContainerStyle={{ backgroundColor: muiThemePalette.accent3Color }}>
                        {/* START MY MAPS TAB */}
                        <Tab label="My Maps" containerElement={<Link to={"/maps"} />} value="maps">
                            <MapListContainer>
                                <MapGridList cols={4} cellHeight={180} padding={10}>
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
                )}

                {userId === null && (
                    <Tabs value={tabName} tabItemContainerStyle={{ backgroundColor: muiThemePalette.accent3Color }}>
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
                )}
            </div>
        )
    }
}

export default MapList
