import { combineReducers } from "redux"
import { reducer as form } from "redux-form"
import { routerReducer } from "react-router-redux"

import ealgis from "./ealgis"
import app from "./app"
import { default as map, IModule as IMapModule } from "./map"
import legends from "./legends"
import maps from "./maps"
import datainspector from "./datainspector"
import datasearch from "./datasearch"
import layerform from "./layerform"
import layerquerysummary from "./layerquerysummary"
import snackbars from "./snackbars"
import { reduxFormReducer as layerFormReducer } from "./layerform"

interface IStore {
    map: IMapModule
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
