import * as React from "react";
import { connect } from 'react-redux';
import CreateMap from "./CreateMap";
import { createMap } from '../actions'

export interface CreateMapContainerProps {
    onSubmit: Function,
}

export class CreateMapContainer extends React.Component<CreateMapContainerProps, undefined> {
    render() {
        const { onSubmit } = this.props
        return <CreateMap onSubmit={onSubmit} />;
    }
}

const mapStateToProps = (state: any) => ({
    
})

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSubmit: (values: Array<undefined>) => {
        return dispatch(createMap(values));
    },
  };
}

const CreateMapContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateMapContainer as any)

export default CreateMapContainerWrapped