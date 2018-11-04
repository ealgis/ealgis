import { CardActions, CardHeader, RaisedButton } from "material-ui"
import { Card, CardText } from "material-ui/Card"
import { Tab, Tabs } from "material-ui/Tabs"
import * as React from "react"
import { Link } from "react-router"
import styled from "styled-components"
import { ILayer, IMapsModule, IMUIThemePalette } from "../../redux/modules/interfaces"

const MapListContainer = styled.div`
    margin-top: 10px;
    padding: 10px;
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

const createMapCards = (maps: Array<Array<any>>, userId: number | null) =>
    maps.map(([mapId, map]: Array<any>) => {
        return (
            <Card key={mapId} style={{ marginBottom: 10 }}>
                <CardHeader
                    title={map.name}
                    subtitle={userId !== null && map.owner_user_id == userId ? map.description : `By ${map.owner.username}`}
                    titleStyle={{ fontWeight: "bold" }}
                />
                <CardText>{map.json.layers.map((layer: ILayer, idx: number) => layer.name).join(", ")}</CardText>
                <CardActions>
                    <RaisedButton label="Open" primary={true} containerElement={<Link to={`/map/${map.id}/${map["name-url-safe"]}`} />} />
                </CardActions>
            </Card>
        )
    })

export class MapList extends React.Component<IProps, {}> {
    render() {
        const { tabName, userId, maps, getMyMaps, getSharedMaps, getPublicMaps, muiThemePalette } = this.props

        return (
            <div>
                {userId !== null && (
                    <Tabs value={tabName}>
                        {/* START MY MAPS TAB */}
                        <Tab label="My Maps" containerElement={<Link to={"/maps"} />} value="maps">
                            <MapListContainer>{createMapCards(getMyMaps(), userId)}</MapListContainer>
                        </Tab>
                        {/* END MY MAPS TAB */}

                        {/* START SHARED TAB */}
                        <Tab label="Shared" containerElement={<Link to={"/shared"} />} value="shared">
                            <MapListContainer>{createMapCards(getSharedMaps(), userId)}</MapListContainer>
                        </Tab>
                        {/* START SHARED TAB */}

                        {/* START PUBLIC TAB */}
                        {/*<Tab
                    label="Public"
                    containerElement={<Link to={"/public"}/>}
                    value="public"
                >
                    <MapListContainer>
                        {createMapCards(getPublicMaps(), userId)}
                    </MapListContainer>
                </Tab>*/}
                        {/* START PUBLIC TAB */}
                    </Tabs>
                )}

                {userId === null && (
                    <Tabs value={tabName} tabItemContainerStyle={{ backgroundColor: muiThemePalette.accent3Color }}>
                        {/* START SHARED TAB */}
                        <Tab label="Shared Maps" containerElement={<Link to={"/shared"} />} value="shared">
                            <MapListContainer>{createMapCards(getSharedMaps(), userId)}</MapListContainer>
                        </Tab>
                        {/* START SHARED TAB */}

                        {/* START PUBLIC TAB */}
                        {/*<Tab
                    label="Public"
                    containerElement={<Link to={"/public"}/>}
                    value="public"
                >
                    <MapListContainer>
                        {createMapCards(getPublicMaps(), userId)}
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
