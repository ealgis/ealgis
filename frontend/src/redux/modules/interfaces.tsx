export { eEalUIComponent, IModule as IAppModule } from "./app"
export {
    eTableChooserLayout,
    IDataBrowserConfig,
    IDataBrowserResult,
    IModule as IDataBrowserModule,
    ISelectedSchemas,
    ITableColumns,
    ITableFamily,
    ITablesBySchemaAndFamily,
} from "./databrowser"
export { IFeature, IFeatureProps, IModule as IDataInspectorpModule, IOLFeature, IOLFeatureProps } from "./datainspector"
export {
    IColourDefs,
    IColourInfo,
    IColumn,
    IColumnInfo,
    IGeomInfo,
    IGeomTable,
    IModule as IEALGISModule,
    ISchema,
    ISchemaInfo,
    ISelectedColumn,
    ISelf,
    ITable,
    ITableInfo,
    IUser,
    IUserPartial,
} from "./ealgis"
export { IModule as ILayerFormModule } from "./layerform"
export { ILayerQuerySummary, IModule as ILayerQuerySummaryModule } from "./layerquerysummary"
export { IModule as ILegendsModule } from "./legends"
export { IModule as IMapModule, IPosition } from "./map"
export {
    eLayerFilterExpressionMode,
    eLayerValueExpressionMode,
    ILayer,
    IMap,
    IMapPositionDefaults,
    IModule as IMapsModule,
    IOLStyleDef,
    IOLStyleDefExpression,
} from "./maps"
export { IStore } from "./reducer"
export { IModule as ISnackbarsModule, ISnackbarMessage } from "./snackbars"

import { IMapPositionDefaults } from "./maps"
export interface IConfig {
    VERSION: string
    ENVIRONMENT: string
    PRIVATE_SITE: boolean
    EALGIS_SITE_CONTACT_EMAIL: string
    GOOGLE_ANALYTICS_UA: string
    GOOGLE_MAPS_API_KEY: string
    MAPBOX_API_KEY: string
    RAVEN_URL: string
    DEFAULT_MAP_POSITION: IMapPositionDefaults
}

/* Material UI muiThemeable palette object */
export interface IMUIThemePalette extends __MaterialUI.Styles.ThemePalette {}

export interface IMUITheme {
    palette: IMUIThemePalette
}

export interface IMUIThemeProps {
    muiTheme: IMUITheme
}
