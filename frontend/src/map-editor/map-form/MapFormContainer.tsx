import * as React from "react"
import { connect } from "react-redux"
import { IMap, IStore } from "../../redux/modules/interfaces"
import { mapUpsert } from "../../redux/modules/maps"
import MapForm from "./MapForm"

export interface IMapFormValues {
    name: string
    description: string
}

export interface IProps {}

export interface IStoreProps {
    mapDefinition: IMap
}

export interface IDispatchProps {
    onSubmit: Function
}

interface IRouteProps {
    mapId: number
    mapName: string
}

export class MapFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, {}> {
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

const mapStateToProps = (state: IStore, ownProps: { params: IRouteProps }): IStoreProps => {
    const { maps } = state

    return {
        mapDefinition: maps[ownProps.params.mapId],
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onSubmit: (map: IMap, values: IMapFormValues) => {
            // Merge form values into our map object
            if (map === undefined) {
                map = {} as IMap
            }
            map = Object.assign(map, values)
            return dispatch(mapUpsert(map))
        },
    }
}

// @ts-ignore
const MapFormContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(MapFormContainer)

export default MapFormContainerWrapped
