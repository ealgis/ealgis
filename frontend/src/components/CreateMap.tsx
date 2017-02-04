import * as React from "react";
import { Link } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import MapsAddLocation from 'material-ui/svg-icons/maps/add-location';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

export interface CreateMapProps {
    defn: any
}

export class CreateMap extends React.Component<CreateMapProps, undefined> {
    render() {
        return <div style={{margin: 5}}>
            <TextField
                hintText="Give your map a name..."
                floatingLabelText="Map name"
                floatingLabelFixed={true}
            />

            <RaisedButton 
                label="Create Map" 
                primary={true}
                icon={<MapsAddLocation />}
                style={{marginTop: 20, marginLeft: "25%"}}
            />
            <RaisedButton 
                label="Cancel" 
                secondary={true}
                containerElement={<Link to={`/`} />}
                icon={<NavigationClose />}
                style={{marginTop: 20, marginLeft: "25%"}}
            />
        </div>
    }
}

export default CreateMap