import * as React from "react";
import { connect } from 'react-redux';
import LegendPeekBar from "./LegendPeekBar";
import * as isEqual from "lodash/isEqual";
import { receiveLegendPeekLabel } from '../actions';

export interface LegendPeekBarContainerProps {
    mapId: number,
    layerId: number,
    olStyleDef: object,
    labelText: string,
    handleMouseEnter: Function,
    handleMouseLeave: Function,
}

export class LegendPeekBarContainer extends React.Component<LegendPeekBarContainerProps, undefined> {
    shouldComponentUpdate(nextProps: any, nextState: any) {
        const { olStyleDef, labelText } = this.props
        
        if(!isEqual(olStyleDef, nextProps.olStyleDef)) {
            return true
        }

        if(labelText !== nextProps.labelText) {
            return true
        }
        return false
    }
    
    render() {
        const { mapId, layerId, olStyleDef, labelText, handleMouseEnter, handleMouseLeave } = this.props
        
        return <LegendPeekBar
                    layerId={layerId}
                    olStyleDef={olStyleDef}
                    handleMouseEnter={(styleDef: object) => 
                        handleMouseEnter(mapId, layerId, styleDef)}
                    handleMouseLeave={(styleDef: object) => 
                        handleMouseLeave(mapId, layerId)}
                    labelText={labelText}
                />
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app } = state
    
    return {
        labelText: app.layerUINav.legendpeek[ownProps.mapId + "-" + ownProps.layerId]
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    handleMouseEnter: (mapId: number, layerId: number, styleDef: object) => {
        let labelText: string = ""
        if("to" in styleDef.expr) {
            labelText = `${parseFloat(styleDef.expr.from.v.toFixed(2)).toLocaleString()} - ${parseFloat(styleDef.expr.to.v.toFixed(2)).toLocaleString()}`
        } else {
            labelText = `>= ${parseFloat(styleDef.expr.from.v.toFixed(2)).toLocaleString()}`
        }
        
        dispatch(receiveLegendPeekLabel(mapId, layerId, labelText))
    },
    handleMouseLeave: (mapId: number, layerId: number) => {
        dispatch(receiveLegendPeekLabel(mapId, layerId, ""))
    },
  }
}

const LegendPeekBarContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(LegendPeekBarContainer as any)

export default LegendPeekBarContainerWrapped