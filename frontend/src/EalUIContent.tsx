import * as React from "react"
import DataBrowser from "./data-browser/data-browser/DataBrowserContainer"
import MapUIContainer from "./openlayers/map-ui/MapUIContainer"
import { eEalUIComponent } from "./redux/modules/interfaces"

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
            return <MapUIContainer params={params} />
        }
    }
}

export default EalUIContent
