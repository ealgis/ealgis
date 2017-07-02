import * as React from "react"
import { connect } from "react-redux"
import DatasetSearch from "./DatasetSearch"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { loadChips as layerFormLoadChips } from "../../redux/modules/layerform"
import * as datasearchModule from "../../redux/modules/datasearch"
import { IStore, IGeomTable, IGeomInfo } from "../../redux/modules/interfaces"

export interface IProps {
    geometry: IGeomTable
}

export interface IStateProps {
    geominfo: IGeomInfo
    dataSearchResults: Map<string, datasearchModule.ITableAndCols>
    chipValues: Array<string>
}

export interface IDispatchProps {
    onChipAdd: Function
    onChipDelete: Function
    onTableLookup: Function
    onCopyToClipboard: Function
}

export class DatasetSearchContainer extends React.Component<IProps & IStateProps & IDispatchProps, {}> {
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
                dataSearchResults={dataSearchResults}
                chipValues={chipValues}
                onChipAdd={(chip: string) => onChipAdd(chip, chipValues, geometry)}
                onChipDelete={(chip: string) => onChipDelete(chip, chipValues, geometry)}
                onTableLookup={(table: datasearchModule.ITable) => onTableLookup(table, geometry)}
                onCopyToClipboard={onCopyToClipboard}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStateProps => {
    const { ealgis, datasearch, layerform } = state

    return {
        geominfo: ealgis.geominfo,
        dataSearchResults: datasearch.results,
        chipValues: layerform.chips,
    }
}

const onChipChange = (chips: Array<string>, geometry: IGeomTable, dispatch: Function) => {
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

const mapDispatchToProps = (dispatch: any): IDispatchProps => {
    return {
        onChipAdd: (chip: string, chipValues: Array<string>, geometry: IGeomTable) => {
            let chips = chipValues
            chips.push(chip)
            dispatch(layerFormLoadChips(chips))

            onChipChange(chips, geometry, dispatch)
        },
        onChipDelete: (chip: string, chipValues: Array<string>, geometry: IGeomTable) => {
            let chips = chipValues.filter((item: string) => item != chip)
            dispatch(layerFormLoadChips(chips))

            if (chips.length > 0) {
                onChipChange(chips, geometry, dispatch)
            } else {
                dispatch(datasearchModule.reset())
            }
        },
        onTableLookup: (table: datasearchModule.ITable, geometry: IGeomTable) => {
            const chipValues = [`table:${table.name}`]
            dispatch(layerFormLoadChips(chipValues))
            dispatch(datasearchModule.fetchColumnsForTable([], geometry, [table.name]))
        },
        onCopyToClipboard: (column_name: string) => {
            dispatch(sendSnackbarNotification(`Column '${column_name}' copied to clipboard.`))
        },
    }
}

const DatasetSearchContainerWrapped = connect<{}, {}, IProps>(mapStateToProps, mapDispatchToProps)(
    DatasetSearchContainer
)

export default DatasetSearchContainerWrapped
