import * as React from "react"

export interface MapCoverImageProps {
    defn: any
    width: number
    height: number
}

export class MapCoverImage extends React.Component<MapCoverImageProps, undefined> {
    render() {
        const { defn, width, height } = this.props

        const mapbox_key =
            "pk.eyJ1Ijoia2VpdGhtb3NzIiwiYSI6IjkxMTViNjcxN2U5ZDBjMTYzYzY2MzQwNTJkZjM1NGFkIn0.HS40UI-OD5lQWBxUCZOwZg" // Where should this live?

        const lon = defn.json.map_defaults.lon
        const lat = defn.json.map_defaults.lat
        const zoom = defn.json.map_defaults.zoom - 3
        const bearing = 0
        const pitch = 0
        const mapbox_static_img = `https://api.mapbox.com/styles/v1/keithmoss/citje9al5004f2ipg4tc3neyi/static/${lon},${lat},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${mapbox_key}`

        return <img src={mapbox_static_img} width="100%" />
    }
}

export default MapCoverImage
