import { groupBy } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import DataSchemaSelect from "./DataSchemaSelect"
import { ISchemaInfo, ISchema } from "../../redux/modules/ealgis";
import { ISelectedSchemas } from "../../redux/modules/databrowser";
import { IStore } from "../../redux/modules/reducer";

interface IProps {
    onChangeSchemaSelection: Function
}

export interface IStoreProps {
    schemainfo: ISchemaInfo
}

export interface IDispatchProps {}

interface IOwnProps {}

interface IState {
    selectedSchemas: Array<any>
}

export class DataSchemaSelectContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IState> {
    self: DataSchemaSelectContainer = this

    constructor(props: IProps & IStoreProps & IDispatchProps) {
        super(props)
        // Initialise the SelectField with all items selected
        this.state = { selectedSchemas: this.getAllSelectableSchemas() }
    }

    getAllSelectableSchemas() {
        const { schemainfo } = this.props

        const schemasByFamily = groupBy(schemainfo, (schema: ISchema) => schema.family)
        const menuItemValues: Array<any> = []

        Object.keys(schemasByFamily).forEach((schema_family_name: string) => {
            if (schema_family_name !== "undefined") {
                menuItemValues.push(`family.${schema_family_name}`)
            } else {
                schemasByFamily[schema_family_name].forEach((schema: ISchema) => {
                    menuItemValues.push(`schema.${schema.name}`)
                })
            }
        })
        return menuItemValues
    }

    getSelectedItems(payload: any) {
        const selectedItems: ISelectedSchemas = {
            schemas: [],
            families: [],
        }

        payload.forEach((value: string) => {
            const [schemaOrFamily, name] = value.split(".")
            if (schemaOrFamily === "schema") {
                selectedItems.schemas.push(name)
            } else if (schemaOrFamily === "family") {
                selectedItems.families.push(name)
            }
        })
        return selectedItems
    }

    render() {
        const { schemainfo, onChangeSchemaSelection } = this.props
        const { selectedSchemas } = this.state

        return (
            <DataSchemaSelect
                schemainfo={schemainfo}
                selectedSchemas={selectedSchemas}
                onSelectSchema={(event: object, key: number, payload: Array<string>) => {
                    this.setState({ selectedSchemas: payload })
                    onChangeSchemaSelection(this.getSelectedItems(payload))
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { ealgis } = state

    return {
        schemainfo: ealgis.schemainfo,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {}
}

const DataSchemaSelectContainerWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(
    DataSchemaSelectContainer
)

export default DataSchemaSelectContainerWrapped
