import * as React from "react";
import { connect } from 'react-redux';
import CreateMap from "./CreateMap";

interface CreateMapContainerRouteParams {
    mapId: Number
}

export interface CreateMapContainerProps {
    map_definition: CreateMapContainerRouteParams,
}

export class CreateMapContainer extends React.Component<CreateMapContainerProps, undefined> {
    render() {
        return <CreateMap />;
    }
}

const mapStateToProps = (state: any) => {
    const { map_definition } = state
    return {
        map_definition: map_definition
    }
}

const CreateMapContainerWrapped = connect(
    mapStateToProps
)(CreateMapContainer)

export default CreateMapContainerWrapped