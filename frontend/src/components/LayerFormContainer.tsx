import * as React from "react";
import { connect } from 'react-redux';
import LayerForm from "./LayerForm";
import { setLayerFormGeometry, layerUpsert } from '../actions'

export interface LayerDefinitionProps {
    borderSize: number,
    fillColourSchemeLevels: number,
    fillOpacity: number,
    scaleMin: number,
    scaleMax: number,
    fillColourScheme: string,
    borderColour: object,
}

export interface LayerFormContainerProps {
    mapDefinition: object,
    layerId: string,
    tabId: string,
    layerDefinition: LayerDefinitionProps,
    datainfo: object,
    colourinfo: object,
    onSubmit: Function,
    onGeometryChange: Function,
}

export class LayerFormContainer extends React.Component<LayerFormContainerProps, undefined> {
    public static defaultProps: Partial<LayerFormContainerProps> = {
        layerDefinition: {
            "borderSize": 1,
            "fillColourSchemeLevels": 6,
            "fillOpacity": 50,
            "scaleMin": 0,
            "scaleMax": 100,
            "fillColourScheme": "Huey",
            "borderColour": {
                r: '51',
                g: '105',
                b: '30',
                a: '1',
            }
        }
    }

    private deriveLayerFormValuesFromLayer = function(layer: object, datainfo: object) {
        return {
            "fillOpacity": layer["fill"]["opacity"] * 100,
            "scaleMin": layer["fill"]["scale_min"],
            "scaleMax": layer["fill"]["scale_max"],
            "valueExpression": layer["fill"]["expression"],
            "fillColourScaleFlip": layer["fill"]["scale_flip"],
            "fillColourScheme": layer["fill"]["scale_name"],
            "filterExpression": layer["fill"]["conditional"],
            "fillColourSchemeLevels": layer["fill"]["scale_nlevels"],
            "borderSize": layer["line"]["width"],
            "borderColour": layer["line"]["colour"],
            "name": layer["name"],
            "description": layer["description"],
            "geometry": datainfo[layer["schema"] + "." + layer["geometry"]],
        }
    }

    private deriveLayerFromLayerFormValues(formValues: Array<undefined>) {
        return {
            "fill": {
                "opacity": formValues["fillOpacity"] / 100,
                "scale_max": formValues["scaleMax"],
                "scale_min": formValues["scaleMin"],
                "expression": formValues["valueExpression"] ? formValues["valueExpression"] : "",
                "scale_flip": formValues["fillColourScaleFlip"],
                "scale_name": formValues["fillColourScheme"],
                "conditional": formValues["filterExpression"] ? formValues["filterExpression"] : "",
                "scale_nlevels": formValues["fillColourSchemeLevels"],
            },
            "line": {
                "width": formValues["borderSize"],
                "colour": formValues["borderColour"],
            },
            "name": formValues["name"],
            "type": formValues["geometry"]["geometry_type"],
            "schema": formValues["geometry"]["schema_name"],
            "visible": true, // New layers are always visible
            "geometry": formValues["geometry"]["name"],
            "description": formValues["description"],
        }
    }

    componentDidMount() {
        const { layerDefinition, datainfo, onGeometryChange } = this.props

        const nextGeometry = datainfo[layerDefinition["schema"] + "." + layerDefinition["geometry"]]
        onGeometryChange(nextGeometry)
    }

    componentWillReceiveProps(nextProps: any) {
        const { layerDefinition, datainfo, layerFormGeometry, onGeometryChange } = this.props

        const nextGeometry = datainfo[layerDefinition["schema"] + "." + layerDefinition["geometry"]]
        if(nextGeometry != layerFormGeometry) {
            onGeometryChange(nextGeometry)
        }
    }

    render() {
        const { layerId, tabId, mapDefinition, layerDefinition, onSubmit, onGeometryChange, datainfo, colourinfo } = this.props
        
        // Initiable values either comes from defaultProps (creating a new layer)
        // or from our layerDef (editing an existing layer)
        let initialValues = JSON.parse(JSON.stringify(layerDefinition))
        if(parseInt(layerId) > 0) {
            initialValues = this.deriveLayerFormValuesFromLayer(layerDefinition, datainfo)
        }

        return <LayerForm 
            mapId={mapDefinition.id} 
            layerId={layerId}
            tabId={tabId}
            initialValues={initialValues} 
            onSubmit={
                (formValues: Array<undefined>) => 
                    onSubmit(mapDefinition, layerId, this.deriveLayerFromLayerFormValues(formValues))
            }
            onGeometryChange={
                (event: any, newValue: object, previousValue: object) =>
                    onGeometryChange(newValue)
            }
            datainfo={datainfo} 
            colourinfo={colourinfo}
        />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app, maps, datainfo, colourinfo } = state

    return {
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        tabId: ownProps.params.tabId,
        layerDefinition: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        datainfo: datainfo,
        colourinfo: colourinfo,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onGeometryChange: (newValue: object) => {
        dispatch(setLayerFormGeometry(newValue))
    },
    onSubmit: (mapDefinition: object, layerId: number, layer: object) => {
        dispatch(layerUpsert(mapDefinition, layerId, layer));
    },
  };
}

const LayerFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayerFormContainer as any)

export default LayerFormContainerWrapped