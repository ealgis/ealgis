import * as React from "react"
import styled from "styled-components"
import { groupBy } from "lodash-es"

import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"
import { ISchemaInfo, ISchema } from "../../redux/modules/ealgis";

const SchemaChooserSelectFied = styled(SelectField)`
    top: 2px !important; /* Align horizontally with the TextField to our left */
`

export interface IProps {
    schemainfo: ISchemaInfo
    selectedSchemas: Array<any>
    onSelectSchema: any
}

export class DataSchemaSelect extends React.PureComponent<IProps, {}> {
    selectionRenderer = (values: any) => {
        switch (values.length) {
            case 0:
                return ""
            case 1:
                return values[0].split(".")[1]
            default:
                return `${values.length} schemas selected`
        }
    }

    menuItems() {
        const { schemainfo, selectedSchemas } = this.props

        const schemasByFamily = groupBy(schemainfo, (schema: ISchema) => schema.family)
        const schemaMenuItems: Array<any> = []

        Object.keys(schemasByFamily).forEach((schema_family_name: string) => {
            if (schema_family_name !== "undefined") {
                schemaMenuItems.push(
                    <MenuItem
                        key={schema_family_name}
                        insetChildren={true}
                        checked={selectedSchemas.includes(`family.${schema_family_name}`)}
                        value={`family.${schema_family_name}`}
                        primaryText={schema_family_name}
                    />
                )
            } else {
                schemasByFamily[schema_family_name].forEach((schema: ISchema) => {
                    schemaMenuItems.push(
                        <MenuItem
                            key={schema.name}
                            insetChildren={true}
                            checked={selectedSchemas.includes(`schema.${schema.name}`)}
                            value={`schema.${schema.name}`}
                            primaryText={schema.name}
                        />
                    )
                })
            }
        })

        return schemaMenuItems
    }

    render() {
        const { selectedSchemas, onSelectSchema } = this.props

        return (
            <SchemaChooserSelectFied
                multiple={true}
                hintText="Select one or more data schemas"
                value={selectedSchemas}
                onChange={onSelectSchema}
                selectionRenderer={this.selectionRenderer}
                autoWidth={true}
                labelStyle={{ color: "#FFFFFF" }}
                hintStyle={{ color: "#FFFFFF" }}
            >
                {this.menuItems()}
            </SchemaChooserSelectFied>
        )
    }
}

export default DataSchemaSelect
