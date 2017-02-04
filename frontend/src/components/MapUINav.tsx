import * as React from "react";
import { Router, Route, Link, browserHistory } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import LayerContainerWrapped from './LayerContainer';

export interface MapUINavProps { defn: any }

export class MapUINav extends React.Component<MapUINavProps, undefined> {
    render() {
        const { defn } = this.props

        if(defn.json !== undefined) {
            // FIXME Layers should be an array, not an object
            let layerObjs = []
            for (let l in defn.json.layers) {
                layerObjs.push(defn.json.layers[l])
            }

            return <div>
                {layerObjs.map((l: any) => {
                    return l.name
                })}

                <Divider style={{marginTop: 25, marginBottom: 25}} />

                <Link to="/">
                    <RaisedButton label="Close Map" secondary={true} />
                </Link>
            </div>
        }

        return <div></div>
    }
}

export default MapUINav