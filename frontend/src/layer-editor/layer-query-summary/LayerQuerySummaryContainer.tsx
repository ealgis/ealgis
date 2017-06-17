import * as React from "react"
import { connect } from "react-redux"
import LayerQuerySummary from "./components/LayerQuerySummary"
import { fetch as fetchLayerQuerySummary } from "../../redux/modules/layerquerysummary"

export interface LayerQuerySummaryContainerProps {
    mapId: number
    layerHash: string
    stats: object
    onFitScaleToData: Function
    fetchQuerySummary: Function
}

export class LayerQuerySummaryContainer extends React.Component<LayerQuerySummaryContainerProps, undefined> {
    componentDidMount() {
        const { fetchQuerySummary, mapId, layerHash } = this.props
        fetchQuerySummary(mapId, layerHash)
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (this.props.mapId !== nextProps.mapId || this.props.layerHash !== nextProps.layerHash) {
            return true
        }

        if (this.props.stats !== nextProps.stats) {
            return true
        }
        return false
    }

    render() {
        const { stats, onFitScaleToData } = this.props

        if (stats === undefined) {
            return <div />
        }

        return <LayerQuerySummary stats={stats} onFitScaleToData={() => onFitScaleToData(stats)} />
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { layerquerysummary } = state

    return {
        stats: layerquerysummary.layers[ownProps.layerHash],
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        fetchQuerySummary: (mapId: number, layerHash: string) => {
            dispatch(fetchLayerQuerySummary(mapId, layerHash))
        },
    }
}

const LayerQuerySummaryContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(
    LayerQuerySummaryContainer as any
)

export default LayerQuerySummaryContainerWrapped
