import { List, ListItem } from "material-ui/List"
import InsertChart from "material-ui/svg-icons/editor/insert-chart"
import MapsLayers from "material-ui/svg-icons/maps/layers"
import * as React from "react"
import { connect } from "react-redux"
import { IFeature } from "../../redux/modules/datainspector";
import { IStore } from "../../redux/modules/reducer";

export interface IProps {}

export interface IStoreProps {
    records: Array<IFeature>
}

export class DataInspector extends React.Component<IProps & IStoreProps, {}> {
    render() {
        const { records } = this.props

        return (
            <List>
                <ListItem
                    primaryText="Data Inspector"
                    secondaryText="Click on the map to drilldown into the data"
                    leftIcon={<InsertChart />}
                    disabled={true}
                />
                {records !== undefined &&
                    records.map((row: any, key: number) => (
                        <ListItem
                            key={key}
                            primaryText={row.name}
                            leftIcon={<MapsLayers />}
                            initiallyOpen={true}
                            primaryTogglesNestedList={true}
                            nestedItems={row.properties.map((propRow: any, key: any) => (
                                <ListItem key={key} primaryText={propRow.value.toString()} secondaryText={propRow.name} />
                            ))}
                        />
                    ))}
            </List>
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { datainspector } = state

    return {
        records: datainspector.records,
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {}
}

const DataInspectorWrapped = connect<IStoreProps, {}, IProps, IStore>(mapStateToProps, mapDispatchToProps)(DataInspector)

export default DataInspectorWrapped
