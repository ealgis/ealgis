import * as React from "react";
import { connect } from 'react-redux';
import LayerQuerySummary from "./LayerQuerySummary";
// import {  } from '../actions'

export interface LayerQuerySummaryContainerProps {
    
}

export class LayerQuerySummaryContainer extends React.Component<LayerQuerySummaryContainerProps, undefined> {
    render() {
        // const {  } = this.props

        return <LayerQuerySummary />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    // const {  } = state

    return {
        
    }
}

const LayerQuerySummaryContainerWrapped = connect(
    mapStateToProps,
)(LayerQuerySummaryContainer as any)

export default LayerQuerySummaryContainerWrapped