import * as React from "react";
import { connect } from 'react-redux';
import DatasetSearch from "./DatasetSearch";
import { sendSnackbarNotification, resetDataDiscovery, fetchColumnsForTable, fetchColumnsByName, fetchColumnsForGeometry, setLayerFormChipValues } from '../actions'

export interface DatasetSearchContainerProps {
    datainfo: object,
    geometry: object,
    onChipAdd: Function,
    onChipDelete: Function,
    onTableLookup: Function,
    chipValues: Array<string>,
    dataDiscovery: Array<any>,
    onCopyToClipboard: Function,
}

export class DatasetSearchContainer extends React.Component<DatasetSearchContainerProps, undefined> {
    render() {
        const { geometry, onChipAdd, onChipDelete, onTableLookup, chipValues, dataDiscovery, onCopyToClipboard } = this.props

        return <DatasetSearch
            onChipAdd={
                (chip: string) => 
                    onChipAdd(chip, chipValues, geometry)
            }
            onChipDelete={
                (chip: string) => 
                    onChipDelete(chip, chipValues, geometry)
            }
            onTableLookup={
                (table: object) => 
                    onTableLookup(table, geometry)
            }
            chipValues={chipValues}
            dataDiscovery={dataDiscovery}
            onCopyToClipboard={onCopyToClipboard}
        />;
    }
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { app, maps, datainfo, colourinfo, tableinfo, form } = state

    return {
        datainfo: datainfo,
        dataDiscovery: app.dataDiscovery,
        chipValues: app.layerForm.chipValues,
    }
}

const onChipChange = (chips: Array<string>, geometry: object, dispatch: Function) => {
    if(geometry === null) {
        dispatch(sendSnackbarNotification("Please choose a geometry from the 'Describe' tab first."))
        return
    }

    // Chips filtered to include general search terms (without 'special' chips like 'column:b117')
    const filterChips = chips.filter((item: string) => {
        if(item.startsWith("table:")) {
            return false
        }
        if(item.startsWith("column:")) {
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
    if(tableNamesInChips.length > 0) {
        dispatch(fetchColumnsForTable(filterChips, geometry, tableNamesInChips))
    } else if(columnNamesInChips.length > 0) {
    // Filter by one or more column names
        dispatch(fetchColumnsByName(columnNamesInChips, geometry))
    } else {
    // Filter by one or more search terms
        dispatch(fetchColumnsForGeometry(chips, geometry))
    }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onChipAdd: (chip: string, chipValues: Array<string>, geometry: object) => {
        let chips = chipValues
        chips.push(chip)
        dispatch(setLayerFormChipValues(chips))

        onChipChange(chips, geometry, dispatch)
    },
    onChipDelete: (chip: string, chipValues: Array<string>, geometry: object) => {
        let chips = chipValues.filter((item: string) => item != chip)
        dispatch(setLayerFormChipValues(chips))

        if(chips.length > 0) {
            onChipChange(chips, geometry, dispatch)
        } else {
            dispatch(resetDataDiscovery())
        }
    },
    onTableLookup: (table: object, geometry: object) => {
        const chipValues = [`table:${table.name}`]
        dispatch(setLayerFormChipValues(chipValues))
        dispatch(fetchColumnsForTable([], geometry, [table.name]))
    },
    onCopyToClipboard: (column_name: string) => {
        dispatch(sendSnackbarNotification(`Column '${column_name}' copied to clipboard.`))
    },
  };
}

const DatasetSearchContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(DatasetSearchContainer as any)

export default DatasetSearchContainerWrapped