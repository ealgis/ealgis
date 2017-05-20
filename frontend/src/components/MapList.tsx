import * as React from "react";
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {Tabs, Tab} from 'material-ui/Tabs';
import {GridList, GridTile} from 'material-ui/GridList';
import FlatButton from 'material-ui/FlatButton';
import MapsLayers from 'material-ui/svg-icons/maps/layers';
import {fullWhite} from 'material-ui/styles/colors';
import MapCoverImage from './MapCoverImageContainer';

const styles = {
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

export interface MapListProps {
    tabName: string,
    userId: number,
    maps: any,
    getMyMaps: Function,
    getSharedMaps: Function,
    getPublicMaps: Function,
}

export class MapList extends React.Component<MapListProps, undefined> {
    render() {
        const { tabName, userId, maps, getMyMaps, getSharedMaps, getPublicMaps } = this.props

        const mapGridTiles = (maps: Array<object>) => 
            maps.map(([key, m]) => 
                <GridTile
                    key={key}
                    containerElement={<Link to={`/map/${m.id}/${m["name-url-safe"]}`} />}
                    title={m.name}
                    subtitle={(m.owner_user_id == userId) ? m.description : `By ${m.owner.username}`}
                    cols={1}
                    titleBackground={'rgba(0, 188, 212, 0.7)'}
                >
                    <MapCoverImage mapDefinition={m} width={250} height={185} />
                </GridTile>
            )

        return <div>
            <Tabs
                value={tabName}
            >
                {/* START MY MAPS TAB */}
                <Tab
                    label="My Maps"
                    containerElement={<Link to={"/"}/>}
                    value=""
                >
                    <div style={styles.root}>
                        <GridList
                            style={styles.gridList}
                            cols={4}
                            cellHeight={180}
                            padding={10}
                        >
                            <GridTile
                                key={"abc"}
                                containerElement={<Link to={"/new/map/"} />}
                                title={"Create New Map"}
                                cols={1}
                            >
                                <FlatButton
                                    backgroundColor={'rgba(205, 205, 205, 0.7)'}
                                    hoverColor={'rgba(154, 154, 154, 0.7)'}
                                    icon={<MapsLayers color={fullWhite} style={styles.createMapIconBig} />}
                                    style={styles.createMapIconButtonBig}
                                />
                            </GridTile>

                            {mapGridTiles(getMyMaps())}
                        </GridList>
                    </div>
                </Tab>
                {/* END MY MAPS TAB */}

                {/* START SHARED TAB */}
                <Tab
                    label="Shared"
                    containerElement={<Link to={"/shared"}/>}
                    value="shared"
                >
                    <div style={styles.root}>
                        <GridList
                            style={styles.gridList}
                            cols={4}
                            cellHeight={180}
                            padding={10}
                        >
                            {mapGridTiles(getSharedMaps())}
                        </GridList>
                    </div>
                </Tab>
                {/* START SHARED TAB */}

                {/* START PUBLIC TAB */}
                <Tab
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
                </Tab>
                {/* START PUBLIC TAB */}
            </Tabs>
        </div>
    }
}

export default MapList