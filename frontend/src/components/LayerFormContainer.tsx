import * as React from "react";
import { connect } from 'react-redux';
import LayerForm from "./LayerForm";
import { fetchCompiledLayerStyle, layerUpsert } from '../actions'

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
    layerId: number,
    layerDefinition: LayerDefinitionProps,
    datainfo: object,
    colourinfo: object,
    onSubmit: Function,
    onChange: Function,
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
            "borderSize": layer["line"]["width"],
            "fillColourSchemeLevels": layer["fill"]["scale_nlevels"],
            "fillColourScaleFlip": layer["fill"]["scale_flip"],
            "fillOpacity": layer["fill"]["opacity"] * 100,
            "scaleMin": layer["fill"]["scale_min"],
            "scaleMax": layer["fill"]["scale_max"],
            "fillColourScheme": layer["fill"]["scale_name"],
            "borderColour": layer["line"]["colour"],
            "name": layer["name"],
            "description": layer["description"],
            "geometry": datainfo[layer["schema"] + "." + layer["geometry"]],
        }
    }

    public static deriveLayerFromLayerFormValues(formValues: Array<undefined>) {
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
            // FIXME Wot is this?
            "background": {
                "label": null
            },
            "description": formValues["description"],
        }
    }

    render() {
        const { layerId, mapDefinition, layerDefinition, onSubmit, onChange, datainfo, colourinfo } = this.props
        
        // Initiable values either comes from defaultProps (creating a new layer)
        // or from our layerDef (editing an existing layer)
        let initialValues = JSON.parse(JSON.stringify(layerDefinition))
        if(layerId !== undefined) {
            initialValues = this.deriveLayerFormValuesFromLayer(layerDefinition, datainfo)
        }

        return <LayerForm 
            mapId={mapDefinition.id} 
            layerId={layerId} 
            initialValues={initialValues} 
            onSubmit={
                (formValues: Array<undefined>) => 
                    onSubmit(mapDefinition, layerId, this.deriveLayerFromLayerFormValues(formValues))
            }
            onChange={(formValues: object) => onChange(formValues, mapDefinition.id, layerId, layerDefinition)}
            datainfo={datainfo} 
            colourinfo={colourinfo} 
        />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps, datainfo, colourinfo } = state

    return {
        mapDefinition: maps[ownProps.params.mapId],
        layerId: ownProps.params.layerId,
        layerDefinition: maps[ownProps.params.mapId].json.layers[ownProps.params.layerId],
        datainfo: datainfo,
        colourinfo: colourinfo,
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSubmit: (mapDefinition: object, layerId: number, layer: object) => {
        dispatch(layerUpsert(mapDefinition, layerId, layer));
    },
    onChange: (formValues: Array<undefined>, mapId: number, layerId: number, layer: object) => {
        if("name" in formValues) { // Ignore change events from Fields (Not sure why these trigger form onChange)
            const newLayer = LayerFormContainer.deriveLayerFromLayerFormValues(formValues)
            // const newLayer = Object.assign(...json.map(d => ({[d.id: d})))
            // console.log(layer)
            // console.log(newLayer)
            // console.log(layer.line, newLayer.line)
            layer.line.width = 2
            console.log("newLayer.line.width", newLayer.line.width)

            if(layer.line != newLayer.line) {
                dispatch(fetchCompiledLayerStyle(mapId, layerId, layer))
            }
        }
    }
  };
}

const LayerFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayerFormContainer as any)

export default LayerFormContainerWrapped