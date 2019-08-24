import * as React from "react"
import { IndexRedirect, Route } from "react-router"
import EalUIContainerWrapped from "./EalUIContainer"
import EalUIContentWrapped from "./EalUIContentContainer"
import LayerFormContainerWrapped from "./layer-editor/layer-form/LayerFormContainer"
import MapFormContainerWrapped from "./map-editor/map-form/MapFormContainer"
import MapUINavContainerWrapped from "./map-ui/map-ui-nav/MapUINavContainer"
import CreateMapSidebar from "./maps-browser/create-map/CreateMapSidebarContainer"
import MapListContainerWrapped from "./maps-browser/map-list/MapListContainer"
import { IStore } from "./redux/modules/reducer";

export default (store: IStore) => {
    return (
        <Route path="/" component={EalUIContainerWrapped}>
            {/* Home (main) route */}
            {/* <IndexRoute components={{ content: Welcome } as any} /> */}
            {/* <IndexRoute components={{ content: MapListContainerWrapped, sidebar: CreateMapSidebar }} /> */}
            <IndexRedirect to="/shared" />

            {/* Maps browser routes */}
            <Route path="(:tabName)" components={{ content: MapListContainerWrapped, sidebar: CreateMapSidebar }} />

            {/* Map and layer routes */}
            <Route path="map/:mapId/:mapName/edit" components={{ content: EalUIContentWrapped, sidebar: MapFormContainerWrapped }} />
            <Route path="map/:mapId/:mapName(/:tabName)" components={{ content: EalUIContentWrapped, sidebar: MapUINavContainerWrapped }} />
            <Route
                path="map/:mapId/:mapName/layer(/:layerId)(/:tabName)/databrowser"
                components={{ content: EalUIContentWrapped, sidebar: LayerFormContainerWrapped }}
            />
            <Route
                path="map/:mapId/:mapName/layer(/:layerId)(/:tabName)(/:component)"
                components={{ content: EalUIContentWrapped, sidebar: LayerFormContainerWrapped }}
            />
            <Route path="new/map/" components={{ content: EalUIContentWrapped, sidebar: MapFormContainerWrapped }} />
        </Route>
    )
}
