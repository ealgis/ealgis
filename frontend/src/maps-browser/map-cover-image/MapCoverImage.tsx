import * as React from "react"
import { IConfig, IMap } from "../../redux/modules/interfaces"
const Config: IConfig = require("Config") as any

export interface IProps {
    defn: IMap
    width: number
    height: number
}

export class MapCoverImage extends React.Component<IProps, {}> {
    render() {
        const { defn, width, height } = this.props

        const lon = defn.json.map_defaults.lon
        const lat = defn.json.map_defaults.lat
        const zoom = defn.json.map_defaults.zoom - 3
        const bearing = 0
        const pitch = 0
        const mapbox_static_img = `https://api.mapbox.com/styles/v1/keithmoss/citje9al5004f2ipg4tc3neyi/static/${lon},${lat},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${Config[
            "MAPBOX_API_KEY"
        ]}`

        return <img src={mapbox_static_img} width="100%" />
    }
}

export default MapCoverImage
