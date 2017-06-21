/**
 * Based heavily on the work of https://github.com/sautumn/material-ui-autocomplete-google-places
 * with additions to return the whole result object, fixed a bug with looking up the wrong placeId, and a few optimisations.
 * See https://github.com/ealgis/material-ui-autocomplete-google-places/tree/ealgis
 * We're not using that directly because we couldn't work out how to get all of the fancy node module
 * building guff working automaticlaly.
 * 
 * Go back and have a go at that later on.
 */

import * as React from "react"
import { AutoComplete, MenuItem } from "material-ui"
import Marker from "material-ui/svg-icons/maps/place"

const styles: React.CSSProperties = {
    menuItem: {
        fontSize: 13,
        display: "block",
        paddingRight: 20,
        overflow: "hidden",
    },
    menuItemInnerDiv: {
        paddingRight: 38,
        paddingLeft: 38,
    },
    menuItemMarker: {
        width: "20px",
    },
}

export interface IProps {
    // Google componentRestrictions
    componentRestrictions?: object
    types?: Array<any>
    // AutoComplete properties
    anchorOrigin?: object
    animated?: boolean
    animation?: Function
    errorStyle?: object
    errorText?: any
    floatingLabelText?: string
    fullWidth?: boolean
    hintText?: string
    listStyle?: object
    maxSearchResults?: number
    menuCloseDelay?: number
    menuProps?: object
    menuStyle?: object
    onClose?: Function
    onNewRequest?: Function
    onUpdateInput?: Function
    open?: boolean
    openOnFocus?: boolean
    popoverProps?: object
    searchText?: string
    style?: object
    targetOrigin?: object
    textFieldStyle?: object
    // Prop types for dataSource
    innerDivStyle?: object
    menuItemStyle?: object
    results?: Function
    // Our props
    inputStyle?: object
    name?: string
    // Internals
}

export interface IState {
    data?: Array<any>
    searchText?: string
}

class GooglePlacesAutocomplete extends React.Component<IProps, IState> {
    geocoder: any
    service: any

    constructor(props: IProps) {
        super(props)

        this.state = {
            data: [],
            searchText: "",
        }

        const google = window.google
        this.geocoder = new google.maps.Geocoder()

        // Documentation for AutocompleteService
        // https://developers.google.com/maps/documentation/javascript/places-autocomplete#place_autocomplete_service
        this.service = new google.maps.places.AutocompleteService(null)

        // binding for functions
        this.updateInput = this.updateInput.bind(this)
        this.populateData = this.populateData.bind(this)
        this.getCurrentDataState = this.getCurrentDataState.bind(this)
        this.getLatLgn = this.getLatLgn.bind(this)
    }

    getCurrentDataState() {
        return this.state.data
    }

    getLatLgn(locationID: any, cb: Function) {
        this.geocoder.geocode({ placeId: locationID }, (results: Array<any>, status: any) => {
            cb(results, status)
        })
    }

    updateInput(searchText: string) {
        if (searchText.length > 0) {
            this.setState(
                {
                    searchText,
                },
                () => {
                    const outerScope = this
                    this.service.getPlacePredictions(
                        {
                            input: this.state.searchText,
                            componentRestrictions: this.props.componentRestrictions,
                            types: this.props.types,
                        },
                        (predictions: Array<any>) => {
                            if (predictions) {
                                outerScope.populateData(predictions)
                            }
                        }
                    )
                }
            )
        }
    }

    populateData(array: Array<any>) {
        this.setState({ data: array })
    }

    getPoweredByGoogleMenuItem() {
        // disabled removed because https://github.com/callemall/material-ui/issues/5131
        return {
            text: "",
            value: (
                <MenuItem
                    style={{ cursor: "default" }}
                    children={
                        <div style={{ paddingTop: 20 }}>
                            <img
                                style={{ float: "right" }}
                                width={96}
                                height={12}
                                src="https://developers.google.com/places/documentation/images/powered-by-google-on-white.png"
                                alt="presentation"
                            />
                        </div>
                    }
                />
            ),
        }
    }

    render() {
        // https://github.com/callemall/material-ui/pull/6231
        const { componentRestrictions, ...autocompleteProps } = this.props

        return (
            <AutoComplete
                {...autocompleteProps}
                // Used by Google Places API / No user input
                searchText={this.state.searchText}
                onUpdateInput={this.updateInput}
                filter={AutoComplete.noFilter}
                onNewRequest={(chosenRequest, index) => {
                    this.getLatLgn(chosenRequest.placeId, results => {
                        this.props.results(
                            results[0].geometry.location.lat(),
                            results[0].geometry.location.lng(),
                            results[0]
                        )
                    })
                }}
                dataSource={this.state.data.map((item, i, a) => {
                    if (i === a.length - 1) {
                        return this.getPoweredByGoogleMenuItem()
                    }

                    return {
                        text: item.description,
                        placeId: item.place_id,
                        value: (
                            <MenuItem
                                style={this.props.menuItemStyle || styles.menuItem}
                                innerDivStyle={this.props.innerDivStyle || styles.menuItemInnerDiv}
                                leftIcon={<Marker style={styles.menuItemMarker} />}
                                // Used by Google Places / No user input
                                primaryText={item.description}
                            />
                        ),
                    }
                })}
            />
        )
    }
}

export default GooglePlacesAutocomplete
