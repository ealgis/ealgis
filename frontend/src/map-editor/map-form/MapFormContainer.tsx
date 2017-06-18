import * as React from "react"
import { connect } from "react-redux"
import MapForm from "./components/MapForm"
import { mapUpsert } from "../../redux/modules/maps"
import { IStore, IMap } from "../../redux/modules/interfaces"

export interface IMapFormValues {
    name: string
    description: string
}

export interface IProps {
    mapDefinition: IMap
    onSubmit: Function
}

interface IRouteProps {
    mapId: number
    mapName: string
}

export class MapFormContainer extends React.Component<IProps, {}> {
    private deriveMapFormValuesFromMap = function(map: IMap) {
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
                onSubmit={(formValues: IMapFormValues) => onSubmit(mapDefinition, formValues)}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: { params: IRouteProps }) => {
    const { maps } = state

    return {
        mapDefinition: maps[ownProps.params.mapId],
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onSubmit: (map: IMap, values: IMapFormValues) => {
            // Merge form values into our map object
            if (map === undefined) {
                map = {} as IMap
            }
            map = Object.assign(map, values)
            // return dispatch(mapUpsert(map))
        },
    }
}

const MapFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(MapFormContainer as any)

export default MapFormContainerWrapped