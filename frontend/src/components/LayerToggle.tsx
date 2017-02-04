import * as React from "react";
import Toggle from 'material-ui/Toggle';

export interface LayerToggleProps {
    l: Object,
    mapId: number,
    onToggle: Function,
}

export class LayerToggle extends React.Component<LayerToggleProps, undefined> {
    render() {
        const { l, mapId, onToggle } = this.props

        return <Toggle
            label={l.name}
            toggled={l.visible}
            onToggle={onToggle}
        />
    }
}

export default LayerToggle