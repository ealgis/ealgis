import * as React from "react";
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {GridList, GridTile} from 'material-ui/GridList';
import FlatButton from 'material-ui/FlatButton';
import MapsLayers from 'material-ui/svg-icons/maps/layers';
import {fullWhite} from 'material-ui/styles/colors';
import MapCoverImage from './MapCoverImageContainer';

export interface MapListProps { maps: any }

export class MapList extends React.Component<MapListProps, undefined> {
    render() {
        const { maps } = this.props

        const styles = {
            root: {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                marginTop: 30,
            },
            gridList: {
                // width: 500,
                // height: 450,
                overflowY: 'auto',
            },
        };

        const style = {
            width: "100%",
            height: "100%"
        };

        return <div style={styles.root}>
            <GridList
                    cellHeight={180}
                    style={styles.gridList}
                    cols={4}
                    cellHeight={200}
                    padding={10}
                >
                    <GridTile
                        key={"abc"}
                        containerElement={<Link to={"/new/map/"} />}
                        title={"Create New Map"}
                        cols={1.5}
                    >
                        <FlatButton
                            backgroundColor={'rgba(205, 205, 205, 0.7)'}
                            hoverColor={'rgba(154, 154, 154, 0.7)'}
                            icon={<MapsLayers color={fullWhite} style={{width: "15%", height: "15%", marginBottom: 25}} />}
                            style={style}
                        />
                    </GridTile>

                    {Object.entries(maps).map(([key, m]) => 
                        <GridTile
                            key={key}
                            containerElement={<Link to={`/map/${m.id}`} />}
                            title={m.name}
                            subtitle={m.description}
                            cols={1.5}
                            titleBackground={'rgba(0, 188, 212, 0.7)'}
                        >
                            <MapCoverImage mapDefinition={m} width={250} height={185} />
                        </GridTile>
                    )}
            </GridList>
        </div>
    }
}

const mapStateToProps = (state: any) => {
    const { maps } = state
    return {
        maps
    }
}

const MapListWrapped = connect(
    mapStateToProps
)(MapList)

export default MapListWrapped
