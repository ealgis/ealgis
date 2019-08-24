import { IMapPositionDefaults } from "./maps";

export interface IConfig {
    VERSION: string
    ENVIRONMENT: string
    PRIVATE_SITE: boolean
    EALGIS_SITE_CONTACT_EMAIL: string
    GOOGLE_ANALYTICS_UA: string
    GOOGLE_MAPS_API_KEY: string
    MAPBOX_API_KEY: string
    EALGIS_BASEMAP_PROVIDER: string
    THUNDERFOREST_API_KEY: string
    THUNDERFOREST_MAP_STYLE: string
    RAVEN_URL: string
    DEFAULT_MAP_POSITION: IMapPositionDefaults
    AUTH_PROVIDERS: {
        MICROSOFT: boolean
        GOOGLE: boolean
        FACEBOOK: boolean
        TWITTER: boolean
        CUSTOM_OAUTH2: {
            name: string
            title: string
        } | null
    }
}

/* Material UI muiThemeable palette object */
export interface IMUIThemePalette extends __MaterialUI.Styles.ThemePalette {}

export interface IMUITheme {
    palette: IMUIThemePalette
}

export interface IMUIThemeProps {
    muiTheme: IMUITheme
}
