import * as Redux from "redux"
import { reducer as form } from "redux-form"
import { routerReducer } from "react-router-redux"

import { default as ealgis, IModule as IEALGISModule } from "./ealgis"
import { default as app, IModule as IAppModule } from "./app"
import { default as map, IModule as IMapModule } from "./map"
import { default as legends, IModule as ILegendsModule } from "./legends"
import { default as maps, IModule as IMapsModule } from "./maps"
import { default as datainspector, IModule as IDataInspectorpModule } from "./datainspector"
import { default as databrowser, IModule as IDataBrowserModule } from "./databrowser"
import { default as layerform, IModule as ILayerFormModule } from "./layerform"
import { default as layerquerysummary, IModule as ILayerQuerySummaryModule } from "./layerquerysummary"
import { default as snackbars, IModule as ISnackbarsModule } from "./snackbars"
import { reduxFormReducer as layerFormReducer } from "./layerform"

const formReducer: any = form // Silencing TypeScript errors due to older @types/redux-form package

export interface IStore {
    ealgis: IEALGISModule
    app: IAppModule
    map: IMapModule
    legends: ILegendsModule
    maps: IMapsModule
    datainspector: IDataInspectorpModule
    databrowser: IDataBrowserModule
    layerform: ILayerFormModule
    layerquerysummary: ILayerQuerySummaryModule
    snackbars: ISnackbarsModule
}

const rootReducer: Redux.Reducer<IStore> = Redux.combineReducers<IStore>({
    ealgis,
    app,
    map,
    legends,
    maps,
    datainspector,
    databrowser,
    layerform,
    layerquerysummary,
    snackbars,
    routing: routerReducer,
    form: formReducer.plugin({
        layerForm: layerFormReducer,
    }),
})

export default rootReducer
