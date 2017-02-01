import * as React from 'react'
import { connect } from 'react-redux';
// import ol from 'openlayers'
import * as ol from 'openlayers';
// import OLComponent from 'ol-react/lib/ol-component'
import * as interaction from 'ol-react/lib/interaction'

// interface ContextTypes {
//     layer: ol.layer.Base,
//     map: ol.Map
// }

// interface ChildContextTypes {
//     source: ol.source.Source
// }

// export interface TileWMSProps {
//     contextTypes: ContextTypes,
//     childContextTypes: ChildContextTypes
// }

// class OLComponent extends React.Component<void, void> {
//   render() {
//     return <div style={{display: 'none'}}>{this.props.children}</div>;;
//   }
// }

interface MapContainerRouteParams {
    mapId: Number
}

export interface MapContainerProps {
    dispatch: Function,
    mapDefinition: MapContainerRouteParams,
}

export class TileWMS extends React.Component<MapContainerProps, undefined> {
    // contextTypes: any;

    // context: IRouterContext & ISomeOtherContext;

    static contextTypes = {
        layer: React.PropTypes.instanceOf(ol.layer.Base),
        map: React.PropTypes.instanceOf(ol.Map)
    }

    static childContextTypes = {
        source: React.PropTypes.instanceOf(ol.source.Source)
    }

    static defaultProps = {
        urls: [
            'https://gs1.localhost:8443/geoserver/gwc/service/wms',
            'https://gs2.localhost:8443/geoserver/gwc/service/wms',
            'https://gs3.localhost:8443/geoserver/gwc/service/wms',
            'https://gs4.localhost:8443/geoserver/gwc/service/wms',
        ],
        params: {'LAYERS': 'EALGIS:93493a38', 'TILED': true, 'SRS': 'EPSG:900913'},
        serverType: 'geoserver',
        cacheSize: 256,
    }
    
    componentDidMount() {
        const { mapDefinition } = this.props
        console.log("context", this.context);
        console.log("props", this.props);
        console.log("mapDefinition", mapDefinition);
        // console.log("ol", ol);
        // console.log("contextTypes", this.contextTypes);
        // console.log("childContextTypes", this.childContextTypes);

        const l = mapDefinition.json.layers[0]
        this.props.params["LAYERS"] = l._geoserver_workspace + ":" + l.hash
        console.log("layer", this.props.params["LAYERS"])

        // const source = ;
        this.context.layer.setSource(new ol.source.TileWMS(Object.assign({}, this.props)))
    }

    getChildContext() {
        return {
            source: this.source
        }
    }

    componentWillUnmount() {}

    render() {
        return <div style={{display: 'none'}}>{this.props.children}</div>;;
    }
}

// TileWMS.contextTypes = {
//   layer: React.PropTypes.instanceOf(ol.layer.Base),
//   map: React.PropTypes.instanceOf(ol.Map)
// }

// TileWMS.childContextTypes = {
//   source: React.PropTypes.instanceOf(ol.source.Source)
// }

const mapStateToProps = (state: any) => {
    const { map_definition } = state
    return {
        mapDefinition: map_definition
    }
}

const TileWMSWrapped = connect(
    mapStateToProps
)(TileWMS as any)

export default TileWMSWrapped