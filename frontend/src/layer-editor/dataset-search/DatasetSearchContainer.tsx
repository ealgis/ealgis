import * as React from "react"
import { connect } from "react-redux"
import DatasetSearch from "./components/DatasetSearch"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { loadChips as layerFormLoadChips } from "../../redux/modules/layerform"
import * as datasearchModule from "../../redux/modules/datasearch"
export interface DatasetSearchContainerProps {
    geominfo: object
    geometry: object
    onChipAdd: Function
    onChipDelete: Function
    onTableLookup: Function
    chipValues: Array<string>
    dataSearchResults: Map<string, datasearchModule.ITableAndCols>
    onCopyToClipboard: Function
}

export class DatasetSearchContainer extends React.Component<DatasetSearchContainerProps, undefined> {
    render() {
        const {
            geometry,
            onChipAdd,
            onChipDelete,
            onTableLookup,
            chipValues,
            dataSearchResults,
            onCopyToClipboard,
        } = this.props

        return (
            <DatasetSearch
                onChipAdd={(chip: string) => onChipAdd(chip, chipValues, geometry)}
                onChipDelete={(chip: string) => onChipDelete(chip, chipValues, geometry)}
                onTableLookup={(table: object) => onTableLookup(table, geometry)}
                chipValues={chipValues}
                dataSearchResults={dataSearchResults}
                onCopyToClipboard={onCopyToClipboard}
            />
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { ealgis, datasearch, layerform } = state

    return {
        geominfo: ealgis.geominfo,
        dataSearchResults: datasearch.results,
        chipValues: layerform.chips,
    }
}

const onChipChange = (chips: Array<string>, geometry: object, dispatch: Function) => {
    if (geometry === null) {
        dispatch(sendSnackbarNotification("Please choose a geometry from the 'Describe' tab first."))
        return
    }

    // Chips filtered to include general search terms (without 'special' chips like 'column:b117')
    const filterChips = chips.filter((item: string) => {
        if (item.startsWith("table:")) {
            return false
        }
        if (item.startsWith("column:")) {
            return false
        }
        return item
    })

    // Chips filtered to only include special 'table' chips (e.g. 'table:foobar')
    let tableNamesInChips = chips.filter((item: string) => item.startsWith("table:"))
    tableNamesInChips = tableNamesInChips.map((item: string) => item.split(":")[1])

    // Chips filtered to only include special 'column' chips (e.g. 'column:b117')
    let columnNamesInChips = chips.filter((item: string) => item.startsWith("column:"))
    columnNamesInChips = columnNamesInChips.map((item: string) => item.split(":")[1])

    // Filter by table names and (optionally) one or more search terms
    if (tableNamesInChips.length > 0) {
        dispatch(datasearchModule.fetchColumnsForTable(filterChips, geometry, tableNamesInChips))
    } else if (columnNamesInChips.length > 0) {
        // Filter by one or more column names
        dispatch(datasearchModule.fetchColumnsByName(columnNamesInChips, geometry))
    } else {
        // Filter by one or more search terms
        dispatch(datasearchModule.fetchColumnsForGeometry(chips, geometry))
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        onChipAdd: (chip: string, chipValues: Array<string>, geometry: object) => {
            let chips = chipValues
            chips.push(chip)
            dispatch(layerFormLoadChips(chips))

            onChipChange(chips, geometry, dispatch)
        },
        onChipDelete: (chip: string, chipValues: Array<string>, geometry: object) => {
            let chips = chipValues.filter((item: string) => item != chip)
            dispatch(layerFormLoadChips(chips))

            if (chips.length > 0) {
                onChipChange(chips, geometry, dispatch)
            } else {
                dispatch(datasearchModule.reset())
            }
        },
        onTableLookup: (table: object, geometry: object) => {
            const chipValues = [`table:${table.name}`]
            dispatch(layerFormLoadChips(chipValues))
            dispatch(datasearchModule.fetchColumnsForTable([], geometry, [table.name]))
        },
        onCopyToClipboard: (column_name: string) => {
            dispatch(sendSnackbarNotification(`Column '${column_name}' copied to clipboard.`))
        },
    }
}

const DatasetSearchContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(DatasetSearchContainer as any)

export default DatasetSearchContainerWrapped
