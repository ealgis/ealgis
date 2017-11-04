import * as React from "react"
import { IColumn } from "../../redux/modules/interfaces"

import { List, ListItem } from "material-ui/List"
import ActionViewColumn from "material-ui/svg-icons/action/view-column"
import ActionGroupWork from "material-ui/svg-icons/action/group-work"
import ActionInput from "material-ui/svg-icons/action/input"
import ActionStars from "material-ui/svg-icons/action/stars"
import ActionSearch from "material-ui/svg-icons/action/search"
import AlertWarning from "material-ui/svg-icons/alert/warning"

import RaisedButton from "material-ui/RaisedButton"
import Popover from "material-ui/Popover"
import TextField from "material-ui/TextField"

// Silence "TS2339: Property 'onBlur' does not exist'" warnings
class BlurableTextField extends React.Component<any, any> {
    render() {
        return <TextField {...this.props} />
    }
}

export interface IProps {
    value: any
    open: boolean
    field: string
    showCreateGroup: boolean
    showValueSpecial: boolean
    showNumericalInput: boolean
    showRelatedColumns: boolean
    onClick: Function
    onFieldChange: Function
    onOpenDataBrowser: any
}

class ExpressionPartItem extends React.Component<IProps, {}> {
    render() {
        const {
            value,
            open,
            field,
            showCreateGroup,
            showValueSpecial,
            showNumericalInput,
            showRelatedColumns,
            onClick,
            onFieldChange,
            onOpenDataBrowser,
        } = this.props

        // @FIXME: Don't assume an integery string is not a column (they may not always start with letters)

        let listItemProps: any = {}
        if (/^\d+$/.test(value)) {
            listItemProps = {
                primaryText: value,
                secondaryText: "Your status is visible to everyone you use with",
                secondaryTextLines: 2,
                leftIcon: <ActionInput />,
                onClick: onClick,
            }
        } else if (value === "$value") {
            listItemProps = {
                primaryText: "Value Special",
                secondaryText: "Your status is visible to everyone you use with",
                secondaryTextLines: 2,
                leftIcon: <ActionStars />,
                onClick: onClick,
            }
        } else if (value === "some-group") {
            listItemProps = {
                primaryText: "Some Group",
                secondaryText: "Your status is visible to everyone you use with",
                secondaryTextLines: 2,
                leftIcon: <ActionGroupWork />,
                onClick: onClick,
            }
        } else if (value && "id" in value) {
            listItemProps = {
                primaryText: `${value.metadata_json.type}, ${value.metadata_json.kind}`,
                secondaryText: "Your status is visible to everyone you use with",
                secondaryTextLines: 2,
                leftIcon: <ActionViewColumn />,
                onClick: onClick,
            }
        } else {
            listItemProps = {
                primaryText: "No data selected",
                secondaryText: "Click here to choose a data point",
                secondaryTextLines: 2,
                leftIcon: <AlertWarning />,
                onClick: onClick,
            }
        }

        listItemProps.open = open
        listItemProps.primaryTogglesNestedList = true
        listItemProps.nestedItems = []

        if (showCreateGroup === true || showValueSpecial === true || showNumericalInput === true || showRelatedColumns === true) {
            listItemProps.nestedItems.push(
                <ListItem
                    key={"search"}
                    primaryText="Search for data"
                    secondaryText="Find a data point to use to filter on"
                    leftIcon={<ActionSearch />}
                    onClick={onOpenDataBrowser}
                />
            )
        }

        if (showCreateGroup) {
            listItemProps.nestedItems.push(
                <ListItem
                    key={"group"}
                    primaryText="Profile photo"
                    secondaryText="Change your Google+ profile photo"
                    leftIcon={<ActionGroupWork />}
                    primaryTogglesNestedList={true}
                    nestedItems={[
                        <ListItem key={1}>
                            <RaisedButton
                                label={"Create Group"}
                                primary={true}
                                onClick={(evt: object) => {
                                    onFieldChange({ field: field, value: "some-group" })
                                }}
                            />
                        </ListItem>,
                    ]}
                />
            )
        }

        if (showValueSpecial) {
            listItemProps.nestedItems.push(
                <ListItem
                    key={"value-special"}
                    primaryText="Value expression"
                    secondaryText="Use the result of your layer's value expression"
                    onClick={(evt: object) => {
                        onFieldChange({ field: field, value: "$value" })
                    }}
                    leftIcon={<ActionStars />}
                />
            )
        }
        if (showNumericalInput) {
            listItemProps.nestedItems.push(
                <ListItem key={"numeric"} leftIcon={<ActionInput style={{ marginTop: "24px" }} />} innerDivStyle={{ paddingTop: "0px" }}>
                    <BlurableTextField
                        defaultValue={value}
                        name="filterExpressionNumericInput"
                        floatingLabelText="Enter a number to filter by"
                        floatingLabelFixed={true}
                        fullWidth={true}
                        onBlur={(event: any, newValue: string) => onFieldChange({ field: field, value: event.target.value })}
                    />
                </ListItem>
            )
        }
        if (showRelatedColumns) {
            listItemProps.nestedItems.push(
                <ListItem
                    key={"related-columns"}
                    primaryText="Show your status"
                    secondaryText="Your status is visible to everyone you use with"
                    leftIcon={<ActionViewColumn />}
                    onClick={(evt: object) => {
                        onFieldChange({ field: field, value: { id: "foo" } })
                    }}
                />
            )
        }

        return <ListItem {...listItemProps} />
    }
}

export default ExpressionPartItem
