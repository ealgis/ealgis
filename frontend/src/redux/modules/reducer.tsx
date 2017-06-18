import { combineReducers } from "redux"
import { reducer as form } from "redux-form"
import { routerReducer } from "react-router-redux"

import { default as ealgis, IModule as IEALGISModule } from "./ealgis"
import { default as app, IModule as IAppModule } from "./app"
import { default as map, IModule as IMapModule } from "./map"
import { default as legends, IModule as ILegendsModule } from "./legends"
import { default as maps, IModule as IMapsModule } from "./maps"
import { default as datainspector, IModule as IDataInspectorpModule } from "./datainspector"
import { default as datasearch, IModule as IDataSearchModule } from "./datasearch"
import { default as layerform, IModule as ILayerFormModule } from "./layerform"
import { default as layerquerysummary, IModule as ILayerQuerySummaryModule } from "./layerquerysummary"
import { default as snackbars, IModule as ISnackbarsModule } from "./snackbars"
import { reduxFormReducer as layerFormReducer } from "./layerform"

interface IStore {
    ealgis: IEALGISModule
    app: IAppModule
    legends: ILegendsModule
    maps: IMapsModule
    datainspector: IDataInspectorpModule
    datasearch: IDataSearchModule
    layerform: ILayerFormModule
    layerquerysummary: ILayerQuerySummaryModule
    snackbars: ISnackbarsModule
}

const rootReducer: Redux.Reducer<IStore> = combineReducers<IStore>({
    ealgis,
    app,
    map,
    legends,
    maps,
    datainspector,
    datasearch,
    layerform,
    layerquerysummary,
    snackbars,
    routing: routerReducer,
    form: form.plugin({
        layerForm: layerFormReducer,
    }),
})

export default rootReducer
