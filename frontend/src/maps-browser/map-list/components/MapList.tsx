import * as React from "react"
import { Link } from "react-router"
import { connect } from "react-redux"
import { Tabs, Tab } from "material-ui/Tabs"
import { GridList, GridTile } from "material-ui/GridList"
import FlatButton from "material-ui/FlatButton"
import MapsLayers from "material-ui/svg-icons/maps/layers"
import { grey500, grey200 } from "material-ui/styles/colors"
import MapCoverImage from "../../map-cover-image/MapCoverImageContainer"
import { IMap, IMapsModule } from "../../../redux/modules/interfaces"

const styles: React.CSSProperties = {
    root: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        martinTop: 30,
        padding: "10px",
    },
    gridList: {
        overflowY: "auto",
        width: "100%",
    },
    createMapIconButtonBig: {
        width: "100%",
        height: "100%",
    },
    createMapIconBig: {
        width: "15%",
        height: "15%",
        marginBottom: "25px",
    },
}

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
                        <div style={styles.root}>
                            <GridList style={styles.gridList} cols={4} cellHeight={180} padding={10}>
                                <GridTile
                                    key={"create-new-map"}
                                    containerElement={<Link to={"/new/map/"} />}
                                    title={"Create Map"}
                                    titleStyle={{ color: "#ffffff" }}
                                    titleBackground={"rgba(0, 188, 212, 0.7)"}
                                    cols={1}
                                >
                                    <FlatButton
                                        icon={<MapsLayers color={grey500} style={styles.createMapIconBig} />}
                                        style={styles.createMapIconButtonBig}
                                    />
                                </GridTile>

                                {mapGridTiles(getMyMaps())}
                            </GridList>
                        </div>
                    </Tab>
                    {/* END MY MAPS TAB */}

                    {/* START SHARED TAB */}
                    <Tab label="Shared" containerElement={<Link to={"/shared"} />} value="shared">
                        <div style={styles.root}>
                            <GridList style={styles.gridList} cols={4} cellHeight={180} padding={10}>
                                {mapGridTiles(getSharedMaps())}
                            </GridList>
                        </div>
                    </Tab>
                    {/* START SHARED TAB */}

                    {/* START PUBLIC TAB */}
                    {/*<Tab
                    label="Public"
                    containerElement={<Link to={"/public"}/>}
                    value="public"
                >
                    <div style={styles.root}>
                        <GridList
                            style={styles.gridList}
                            cols={4}
                            cellHeight={180}
                            padding={10}
                        >
                            {mapGridTiles(getPublicMaps())}
                        </GridList>
                    </div>
                </Tab>*/}
                    {/* START PUBLIC TAB */}
                </Tabs>
            </div>
        )
    }
}

export default MapList
