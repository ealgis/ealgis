import * as React from "react"
import { eEalUIComponent } from "./redux/modules/interfaces"
import DataBrowser from "./data-browser/data-browser/DataBrowserContainer"
import MapUI from "./openlayers/map-ui/MapUIContainer"

export interface IProps {
    component: eEalUIComponent
    params: any
}

export class EalUIContent extends React.Component<IProps, {}> {
    render() {
        const { component, params } = this.props

        if (component === eEalUIComponent.DATA_BROWSER) {
            return <DataBrowser params={params} />
        } else {
            return <MapUI params={params} />
        }
    }
}

export default EalUIContent
