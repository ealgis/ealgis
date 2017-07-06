export { IStore } from "./reducer"
export { IModule as IEALGISModule, IUser, IUserPartial, IGeomInfo, IGeomTable, ITableInfo, IColourInfo } from "./ealgis"
export { IModule as IAppModule } from "./app"
export { IModule as IMapModule, IPosition } from "./map"
export { IModule as ILegendsModule } from "./legends"
export { IModule as IMapsModule, IMap, ILayer, IOLStyleDef, IMapPositionDefaults } from "./maps"
export { IModule as IDataInspectorpModule, IFeature, IFeatureProps, IOLFeature, IOLFeatureProps } from "./datainspector"
export { IModule as IDataSearchModule, ITableAndCols, ITable, IColumn, MetadataJSON } from "./datasearch"
export { IModule as ILayerFormModule } from "./layerform"
export { IModule as ILayerQuerySummaryModule, ILayerQuerySummary } from "./layerquerysummary"
export { IModule as ISnackbarsModule, ISnackbarMessage } from "./snackbars"

/* Material UI muiThemeable palette object */
export interface IMUIThemePalette extends __MaterialUI.Styles.ThemePalette {}

export interface IMUITheme {
    palette: IMUIThemePalette
}

export interface IMUIThemeProps {
    muiTheme: IMUITheme
}
