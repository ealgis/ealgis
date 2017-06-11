import Promise from "promise-polyfill"
import "whatwg-fetch"
import { browserHistory } from "react-router"
import cookie from "react-cookie"
import { getFormValues } from "redux-form"
import { compileLayerStyle } from "../shared/openlayers/OLStyle"
import { SubmissionError } from "redux-form"
import { EALGISApiClient } from "../shared/api/EALGISApiClient"
import { getMapURL } from "../shared/utils"
import { fetchMaps } from "../redux/modules/maps"

export const RECEIVE_APP_LOADED = "RECEIVE_APP_LOADED"
export const RECEIVE_TOGGLE_SIDEBAR_STATE = "RECEIVE_TOGGLE_SIDEBAR_STATE"
export const RECEIVE_NEW_SNACKBAR_MESSAGE = "RECEIVE_NEW_SNACKBAR_MESSAGE"
export const RECEIVE_START_SNACKBAR_IF_NEEDED = "RECEIVE_START_SNACKBAR_IF_NEEDED"
export const RECEIVE_ITERATE_SNACKBAR = "RECEIVE_ITERATE_SNACKBAR"
export const REQUEST_MAPS = "REQUEST_MAPS"
export const REQUEST_USER = "REQUEST_USER"
export const RECEIVE_USER = "RECEIVE_USER"
export const REQUEST_MAP_DEFINITION = "REQUEST_MAP_DEFINITION"
export const RECEIVE_MAP_DEFINITION = "RECEIVE_MAP_DEFINITION"
export const COMPILED_LAYER_STYLE = "COMPILED_LAYER_STYLE"
export const REQUEST_DATA_INFO = "REQUEST_DATA_INFO"
export const RECEIVE_DATA_INFO = "RECEIVE_DATA_INFO"
export const REQUEST_COLOUR_INFO = "REQUEST_COLOUR_INFO"
export const RECEIVE_COLOUR_INFO = "RECEIVE_COLOUR_INFO"
export const RECEIVE_TOGGLE_MODAL_STATE = "RECEIVE_TOGGLE_MODAL_STATE"
export const RECEIVE_UPDATE_DATA_INSPECTOR = "RECEIVE_UPDATE_DATA_INSPECTOR"
export const RECEIVE_RESET_DATA_INSPECTOR = "RECEIVE_RESET_DATA_INSPECTOR"
export const RECEIVE_TOGGLE_DEBUG_MODE = "RECEIVE_TOGGLE_DEBUG_MODE"
export const RECEIVE_REQUEST_BEGIN_FETCH = "RECEIVE_REQUEST_BEGIN_FETCH"
export const RECEIVE_REQUEST_FINISH_FETCH = "RECEIVE_REQUEST_FINISH_FETCH"
export const RECEIVE_UPDATE_DATA_DISCOVERY = "RECEIVE_UPDATE_DATA_DISCOVERY"
export const RECEIVE_RESET_DATA_DISCOVERY = "RECEIVE_RESET_DATA_DISCOVERY"
export const RECEIVE_TABLE_INFO = "RECEIVE_TABLE_INFO"
export const RECEIVE_TOGGLE_LAYERFORM_SUBMITTING = "RECEIVE_TOGGLE_LAYERFORM_SUBMITTING"
export const RECEIVE_CHIP_VALUES = "RECEIVE_CHIP_VALUES"
export const RECEIVE_APP_PREVIOUS_PATH = "RECEIVE_APP_PREVIOUS_PATH"
export const RECEIVE_LAYER_QUERY_SUMMARY = "RECEIVE_LAYER_QUERY_SUMMARY"
export const RECEIVE_LAYERFORM_ERRORS = "RECEIVE_LAYERFORM_ERRORS"
export const RECEIVE_LEGENDPEEK_LABEL = "RECEIVE_LEGENDPEEK_LABEL"
export const RECEIVE_SET_USER_MENU_STATE = "RECEIVE_SET_USER_MENU_STATE"
export const RECEIVE_RESET_MAP_POSITION = "RECEIVE_RESET_MAP_POSITION"
export const RECEIVE_SET_MAP_POSITION = "RECEIVE_SET_MAP_POSITION"
export const RECEIVE_MAP_MOVE_END = "RECEIVE_MAP_MOVE_END"
export const RECEIVE_BEGIN_PUBLISH_LAYER = "RECEIVE_BEGIN_PUBLISH_LAYER"
export const RECEIVE_BEGIN_RESTORE_MASTER_LAYER = "RECEIVE_BEGIN_RESTORE_MASTER_LAYER"
export const RECEIVE_GOOGLE_PLACES_RESULT = "RECEIVE_GOOGLE_PLACES_RESULT"
export const RECEIVE_START_LAYER_EDIT_SESSION = "RECEIVE_START_LAYER_EDIT_SESSION"
export const RECEIVE_FIT_SCALE_TO_DATA = "RECEIVE_FIT_SCALE_TO_DATA"
export const RECEIVE_HIGHLIGHTED_FEATURES = "RECEIVE_HIGHLIGHTED_FEATURES"

const ealapi = new EALGISApiClient()

export function requestUser() {
    return {
        type: REQUEST_USER,
    }
}

export function receiveUser(json: any) {
    return {
        type: RECEIVE_USER,
        json,
    }
}

export function requestMaps() {
    return {
        type: REQUEST_MAPS,
    }
}

export function requestMapDefinition() {
    return {
        type: REQUEST_MAP_DEFINITION,
    }
}

export function receiveCompiledLayerStyle(mapId: number, layerId: number, olStyle: any) {
    return {
        type: COMPILED_LAYER_STYLE,
        mapId,
        layerId,
        olStyle,
    }
}

export function requestDataInfo() {
    return {
        type: REQUEST_DATA_INFO,
    }
}

export function receiveDataInfo(json: any) {
    return {
        type: RECEIVE_DATA_INFO,
        json,
    }
}

export function receiveColourInfo(json: any) {
    return {
        type: RECEIVE_COLOUR_INFO,
        json,
    }
}

export function requestColourInfo() {
    return {
        type: REQUEST_COLOUR_INFO,
    }
}

export function receiveAppLoaded() {
    return {
        type: RECEIVE_APP_LOADED,
    }
}

export function receiveSidebarState() {
    return {
        type: RECEIVE_TOGGLE_SIDEBAR_STATE,
    }
}

export function receiveIterateSnackbar() {
    return {
        type: RECEIVE_ITERATE_SNACKBAR,
    }
}

export function receiveStartSnackbarIfNeeded() {
    return {
        type: RECEIVE_START_SNACKBAR_IF_NEEDED,
    }
}

export function receiveNewSnackbarMessage(message: object) {
    return {
        type: RECEIVE_NEW_SNACKBAR_MESSAGE,
        message,
    }
}

export function handleIterateSnackbar() {
    return (dispatch: any) => {
        return dispatch(receiveIterateSnackbar())
    }
}

export function addNewSnackbarMessageAndStartIfNeeded(message: object) {
    return (dispatch: any) => {
        dispatch(receiveNewSnackbarMessage(message))
        return dispatch(receiveStartSnackbarIfNeeded())
    }
}

export function sendSnackbarNotification(message: string) {
    return (dispatch: any) => {
        return dispatch(
            addNewSnackbarMessageAndStartIfNeeded({
                message: message,
                autoHideDuration: 2500,
            })
        )
    }
}

export function receiveResetMapPosition(position: any) {
    return {
        type: RECEIVE_RESET_MAP_POSITION,
        position,
    }
}

export function receiveSetMapPosition(position: any) {
    return {
        type: RECEIVE_SET_MAP_POSITION,
        position,
    }
}

export function receiveMapMoveEnd(position: any) {
    return {
        type: RECEIVE_MAP_MOVE_END,
        position,
    }
}

export function receiveToggleModalState(modalId: string) {
    return {
        type: RECEIVE_TOGGLE_MODAL_STATE,
        modalId,
    }
}

export function toggleModalState(modalId: string) {
    return (dispatch: any) => {
        dispatch(receiveToggleModalState(modalId))
    }
}

export function receiveBeginFetch() {
    return {
        type: RECEIVE_REQUEST_BEGIN_FETCH,
    }
}

export function receiveFinishFetch() {
    return {
        type: RECEIVE_REQUEST_FINISH_FETCH,
    }
}

export function fetchCompiledLayerStyle(mapId: number, layerId: number, layer: Object) {
    return (dispatch: any) => {
        let do_fill = layer["fill"]["expression"] != ""
        if (do_fill) {
            const params = {
                opacity: layer["fill"].opacity,
                scale_max: layer["fill"].scale_max,
                scale_min: layer["fill"].scale_min,
                expression: layer["fill"].expression,
                scale_flip: layer["fill"].scale_flip,
                scale_name: layer["fill"].scale_name,
                scale_nlevels: layer["fill"].scale_nlevels,
            }

            return (
                ealapi
                    .get("/api/0.1/maps/compileStyle/", dispatch, params)
                    .then(({ response, json }: any) => {
                        layer.olStyleDef = json
                        layer.olStyle = compileLayerStyle(layer, false, [])
                    })
                    // Wrap layer.olStyle in a function because dotProp automatically executes functions
                    .then((json: any) => dispatch(receiveCompiledLayerStyle(mapId, layerId, () => layer.olStyle)))
            )
        }
    }
}

export function resetMapPosition(mapDefaults: any) {
    return (dispatch: any) => {
        dispatch(
            receiveResetMapPosition({
                center: mapDefaults.center,
                zoom: mapDefaults.zoom,
                allowUpdate: true,
            })
        )
    }
}

export function receiveStartLayerEditSession() {
    return {
        type: RECEIVE_START_LAYER_EDIT_SESSION,
    }
}

export function receiveFitScaleToData() {
    return {
        type: RECEIVE_FIT_SCALE_TO_DATA,
    }
}

export function receiveGooglePlacesResult() {
    return {
        type: RECEIVE_GOOGLE_PLACES_RESULT,
    }
}

export function moveToGooglePlacesResult(extent: Array<number>) {
    return (dispatch: any) => {
        dispatch(receiveGooglePlacesResult())
        dispatch(
            receiveSetMapPosition({
                extent: extent,
                zoom: 18,
                allowUpdate: true,
            })
        )
    }
}

export function onMapMoveEnd(position: object) {
    return (dispatch: any) => {
        dispatch(receiveMapMoveEnd(position))
    }
}

export function fetchUserMapsDataAndColourInfo() {
    // https://github.com/reactjs/redux/issues/1676
    // Again, Redux Thunk will inject dispatch here.
    // It also injects a second argument called getState() that lets us read the current state.
    return (dispatch: any, getState: Function) => {
        // Remember I told you dispatch() can now handle thunks?
        return dispatch(fetchUser()).then((user: object) => {
            if (user.id !== null) {
                // And we can dispatch() another thunk now!
                return dispatch(fetchMaps()).then(() => {
                    return dispatch(fetchDataInfo()).then(() => {
                        return dispatch(fetchColourInfo()).then(() => {
                            dispatch(receiveAppLoaded())
                        })
                    })
                })
            } else {
                dispatch(receiveAppLoaded())
            }
        })
    }
}

export function fetchUser() {
    return (dispatch: any) => {
        dispatch(requestUser())

        return ealapi.get("/api/0.1/self", dispatch).then(({ response, json }: any) => {
            dispatch(receiveUser(json))
            return json
        })
    }
}

export function logoutUser() {
    return (dispatch: any) => {
        return ealapi.get("/api/0.1/logout", dispatch).then(({ response, json }: any) => {
            window.location.reload()
        })
    }
}

/*
So, there seems to be two approaches to handling the "How do I do some action on the site (like using React-Router to change pages)?" question.

1. Pass a callback function in and call that from the action.

2. Call react-router directly from the action.

Some further reading on the subject:

- https://github.com/reactjs/redux/issues/291
- http://stackoverflow.com/questions/36886506/redux-change-url-when-an-async-action-is-dispatched
*/

export function fetchDataInfo() {
    return (dispatch: any) => {
        dispatch(requestDataInfo())

        return ealapi.get("/api/0.1/datainfo/", dispatch).then(({ response, json }: any) => {
            const ordered = {}
            Object.keys(json).sort().forEach(function(key) {
                ordered[key] = json[key]
            })

            dispatch(receiveDataInfo(ordered))
        })
    }
}

export function fetchColourInfo() {
    return (dispatch: any) => {
        dispatch(requestColourInfo())

        return ealapi.get("/api/0.1/colours/", dispatch).then(({ response, json }: any) => {
            dispatch(receiveColourInfo(json))
        })
    }
}

export function updateDataInspector(dataRows: Array<any>) {
    return {
        type: RECEIVE_UPDATE_DATA_INSPECTOR,
        dataRows,
    }
}

export function resetDataInspector() {
    return {
        type: RECEIVE_RESET_DATA_INSPECTOR,
    }
}

export function sendToDataInspector(mapId: number, features: Array<undefined>) {
    return (dispatch: any, getState: Function) => {
        features.forEach((feature: any) => {
            const featureProps = feature.featureProps
            const map = getState().maps[feature.mapId]
            const layer = map.json.layers[feature.layerId]

            ealapi
                .get(`/api/0.1/datainfo/${layer.geometry}/?schema=${layer.schema}&gid=${featureProps.gid}`, dispatch)
                .then(({ response, json }: any) => {
                    let dataRowProps: Array<any> = [
                        {
                            name: "Value",
                            value: featureProps.q,
                        },
                    ]

                    for (let key in json) {
                        if (key !== "gid") {
                            dataRowProps.push({
                                name: key,
                                value: json[key],
                            })
                        }
                    }

                    dispatch(
                        updateDataInspector([
                            {
                                name: `Layer ${layer.name}`,
                                properties: dataRowProps,
                            },
                        ])
                    )

                    browserHistory.push(getMapURL(getState().maps[mapId]) + "/data")
                })
        })
    }
}

export function toggleDebugMode() {
    return {
        type: RECEIVE_TOGGLE_DEBUG_MODE,
    }
}

export function receiveTableInfo(json: any) {
    return {
        type: RECEIVE_TABLE_INFO,
        json,
    }
}

export function updateDataDiscovery(dataColumns: object) {
    return {
        type: RECEIVE_UPDATE_DATA_DISCOVERY,
        dataColumns,
    }
}

export function setLayerFormChipValues(chipValues: Array<string>) {
    return {
        type: RECEIVE_CHIP_VALUES,
        chipValues,
    }
}

export function resetDataDiscovery() {
    return {
        type: RECEIVE_RESET_DATA_DISCOVERY,
    }
}

export function processResponseForDataDiscovery(response: object, json: object, dispatch: Function) {
    if (response.status === 404) {
        dispatch(sendSnackbarNotification("No columns found matching your search criteria."))
        return
    }

    dispatch(receiveTableInfo(json["tables"]))

    let columnsByTable = {}
    for (let key in json["columns"]) {
        const col = json["columns"][key]
        if (columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]] === undefined) {
            columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]] = {
                table: json["tables"][col["tableinfo_id"]],
                columns: [],
            }
        }
        columnsByTable[json["tables"][col["tableinfo_id"]].metadata_json["type"]].columns.push(col)
    }
    dispatch(updateDataDiscovery(columnsByTable))
}

export function getColumnsForGeometry(chips: Array<string>, geometry: object) {
    return (dispatch: any) => {
        const params = {
            search: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        }
        return ealapi.get("/api/0.1/columninfo/search/", dispatch, params)
    }
}

export function fetchColumnsForGeometry(chips: Array<string>, geometry: object) {
    return (dispatch: any, getState: Function) => {
        dispatch(resetDataDiscovery())

        return dispatch(getColumnsForGeometry(chips, geometry)).then(({ response, json }) => {
            processResponseForDataDiscovery(response, json, dispatch)
        })
    }
}

export function getColumnsForTable(chips: Array<string>, geometry: object, table_names: Array<string>) {
    return (dispatch: any) => {
        const params = {
            search: chips.join(","),
            schema: geometry["schema_name"],
            tableinfo_name: table_names.join(","),
        }
        return ealapi.get("/api/0.1/columninfo/search/", dispatch, params)
    }
}

export function fetchColumnsForTable(chips: Array<string>, geometry: object, table_names: Array<string>) {
    return (dispatch: any, getState: Function) => {
        dispatch(resetDataDiscovery())

        return dispatch(getColumnsForTable(chips, geometry, table_names)).then(({ response, json }) => {
            processResponseForDataDiscovery(response, json, dispatch)
        })
    }
}

export function getColumnsByName(chips: Array<string>, geometry: object) {
    return (dispatch: any) => {
        const params = {
            name: chips.join(","),
            schema: geometry["schema_name"],
            geo_source_id: geometry["_id"],
        }
        return ealapi.get("/api/0.1/columninfo/by_name/", dispatch, params)
    }
}

export function fetchColumnsByName(chips: Array<string>, geometry: object) {
    return (dispatch: any, getState: Function) => {
        dispatch(resetDataDiscovery())

        return dispatch(getColumnsByName(chips, geometry)).then(({ response, json }) => {
            processResponseForDataDiscovery(response, json, dispatch)
        })
    }
}

export function receiveAppPreviousPath(previousPath: string) {
    return {
        type: RECEIVE_APP_PREVIOUS_PATH,
        previousPath,
    }
}

export function fetchLayerQuerySummary(mapId: number, layerHash: string) {
    return (dispatch: any) => {
        const payload = { layer: layerHash }
        return ealapi
            .get(`/api/0.1/maps/${mapId}/query_summary/`, dispatch, payload)
            .then(({ response, json }: any) => {
                dispatch(receiveLayerQuerySummary(json, layerHash))
            })
    }
}

export function receiveLayerQuerySummary(stats: object, layerHash: string) {
    return {
        type: RECEIVE_LAYER_QUERY_SUMMARY,
        stats,
        layerHash,
    }
}

export function receiveLegendPeekLabel(mapId: number, layerId: number, labelText: string) {
    return {
        type: RECEIVE_LEGENDPEEK_LABEL,
        mapId,
        layerId,
        labelText,
    }
}

export function setUserMenuState(open: boolean) {
    return {
        type: RECEIVE_SET_USER_MENU_STATE,
        open,
    }
}

export function setHighlightedFeatures(featurGids: Array<number>) {
    return {
        type: RECEIVE_HIGHLIGHTED_FEATURES,
        featurGids,
    }
}

export function receiveBeginPublishLayer() {
    return {
        type: RECEIVE_BEGIN_PUBLISH_LAYER,
    }
}

export function receiveBeginRestoreMasterLayer() {
    return {
        type: RECEIVE_BEGIN_RESTORE_MASTER_LAYER,
    }
}

export function toggleLayerFormSubmitting() {
    return {
        type: RECEIVE_TOGGLE_LAYERFORM_SUBMITTING,
    }
}

export function receiveLayerFormErrors(errors: object) {
    return {
        type: RECEIVE_LAYERFORM_ERRORS,
        errors,
    }
}
