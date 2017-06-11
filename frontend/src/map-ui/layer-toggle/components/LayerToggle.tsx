import * as React from "react"
import Toggle from "material-ui/Toggle"

export interface LayerToggleProps {
    layerDefinition: Object
    mapId: number
    onToggle: Function
}

export class LayerToggle extends React.Component<LayerToggleProps, undefined> {
    render() {
        const { layerDefinition, mapId, onToggle } = this.props

        return <Toggle label={layerDefinition.name} toggled={layerDefinition.visible} onToggle={onToggle} />
    }
}

export default LayerToggle
