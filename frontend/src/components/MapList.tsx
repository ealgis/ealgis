import * as React from "react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Link } from 'react-router';
import { connect } from 'react-redux';

export interface MapListProps { maps: any }

export class MapList extends React.Component<MapListProps, undefined> {
    render() {
        const { maps } = this.props
        return <div style={{display: 'flex', flex: "1 1 auto"}}>
            <main className="page-main-content">
                    
            </main>
            <nav className="page-nav">
                <Menu>
                {maps.map((m: any) => 
                    <MenuItem 
                        key={m.id}
                        containerElement={<Link to={`/map/${m.id}`} />}
                        primaryText={m.name} />
                }
                </Menu>
            </nav>
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
