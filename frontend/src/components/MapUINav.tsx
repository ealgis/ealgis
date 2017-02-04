import * as React from "react";
import { Link } from 'react-router';
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import LayerToggle from './LayerToggleContainer';

export interface MapUINavProps {
    defn: any
    onCloseMap: Function,
}

export class MapUINav extends React.Component<MapUINavProps, undefined> {
    render() {
        const { defn, onCloseMap } = this.props

        if(defn.json !== undefined) {
            // FIXME Layers should be an array, not an object
            let layerObjs = []
            for (let l in defn.json.layers) {
                layerObjs.push(defn.json.layers[l])
            }

            return <div>
                <h2 style={{textAlign: "center"}}>{defn.name}</h2>
                <List>
                    <Subheader>Layers</Subheader>
                    {layerObjs.map((l: any) => {
                        return <ListItem 
                                key={l.hash}
                                disableTouchRipple={true}
                            >
                            <LayerToggle
                                l={l}
                                mapId={defn.id}
                            />
                        </ListItem>
                    })}
                </List>

                <RaisedButton 
                    label="Close Map" 
                    secondary={true}
                    icon={<NavigationClose />}
                    containerElement={<Link to={`/`} />}
                    style={{marginTop: 20, marginLeft: "25%"}}
                    onClick={onCloseMap}
                />
            </div>
        }

        return <div></div>
    }
}

export default MapUINav