import * as React from "react"
import { connect } from "react-redux"
import LayerQuerySummary from "./LayerQuerySummary"
import { fetch as fetchLayerQuerySummary } from "../../redux/modules/layerquerysummary"
import { IStore, ILayerQuerySummary } from "../../redux/modules/interfaces"

export interface IProps {
    mapId: number
    layerHash: string
    onFitScaleToData: Function
}

export interface IStoreProps {
    stats: ILayerQuerySummary
}

export interface IDispachProps {
    fetchQuerySummary: Function
}

export class LayerQuerySummaryContainer extends React.Component<IProps & IStoreProps & IDispachProps, {}> {
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

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { layerquerysummary } = state

    return {
        stats: layerquerysummary.layers[ownProps.layerHash],
    }
}

const mapDispatchToProps = (dispatch: Function): IDispachProps => {
    return {
        fetchQuerySummary: (mapId: number, layerHash: string) => {
            dispatch(fetchLayerQuerySummary(mapId, layerHash))
        },
    }
}

const LayerQuerySummaryContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(
    LayerQuerySummaryContainer
)

export default LayerQuerySummaryContainerWrapped
