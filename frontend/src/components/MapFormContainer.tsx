import * as React from "react"
import { connect } from "react-redux"
import MapForm from "./MapForm"
import { mapUpsert } from "../actions"

export interface MapFormContainerProps {
    mapDefinition: any
    onSubmit: Function
}

export class MapFormContainer extends React.Component<MapFormContainerProps, undefined> {
    private deriveMapFormValuesFromMap = function(map: object) {
        return {
            name: map["name"],
            description: map["description"],
        }
    }

    render() {
        const { mapDefinition, onSubmit } = this.props

        // Initiable values either comes from defaultProps (creating a new map)
        // or from our mapDefinition (editing an existing map)
        let initialValues = {}
        if (mapDefinition !== undefined) {
            initialValues = JSON.parse(JSON.stringify(mapDefinition))
            initialValues = this.deriveMapFormValuesFromMap(mapDefinition)
        }

        return (
            <MapForm
                mapDefinition={mapDefinition}
                initialValues={initialValues}
                onSubmit={(formValues: Array<undefined>) => onSubmit(mapDefinition, formValues)}
            />
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { maps } = state

    return {
        mapDefinition: maps[ownProps.params.mapId],
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        onSubmit: (map: object, values: Array<undefined>) => {
            // Merge form values into our map object
            if (map === undefined) {
                map = {}
            }
            map = Object.assign(map, values)
            return dispatch(mapUpsert(map))
        },
    }
}

const MapFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(MapFormContainer as any)

export default MapFormContainerWrapped
