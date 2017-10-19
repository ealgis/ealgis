import * as React from "react"

import RaisedButton from "material-ui/RaisedButton"
import Popover from "material-ui/Popover"
import { List, ListItem } from "material-ui/List"
import TextField from "material-ui/TextField"
import ActionViewColumn from "material-ui/svg-icons/action/view-column"
import ActionGroupWork from "material-ui/svg-icons/action/group-work"
import ActionInput from "material-ui/svg-icons/action/input"
import ActionStars from "material-ui/svg-icons/action/stars"
import AlertWarning from "material-ui/svg-icons/alert/warning"

export interface IProps {
    open: any
    anchorEl: any
    handleRequestClose: any
    onFieldChange: Function
    onOpenDataBrowser: any
    showCreateGroup: boolean
    showValueSpecial: boolean
    showNumericalInput: boolean
    showRelatedColumns: boolean
}

class ExpressionPartSelector extends React.Component<IProps, {}> {
    render() {
        const {
            open,
            anchorEl,
            handleRequestClose,
            onFieldChange,
            onOpenDataBrowser,
            showCreateGroup,
            showValueSpecial,
            showNumericalInput,
            showRelatedColumns,
        } = this.props

        return (
            <Popover
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{ horizontal: "right", vertical: "top" }}
                targetOrigin={{ horizontal: "left", vertical: "bottom" }}
                onRequestClose={handleRequestClose}
                style={{ width: "350px" }}
            >
                <List>
                    {showCreateGroup && (
                        <ListItem
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
                                            onFieldChange({ field: "col2", value: "some-group" })
                                        }}
                                    />
                                </ListItem>,
                            ]}
                        />
                    )}
                    {showValueSpecial && (
                        <ListItem
                            primaryText="Profile photo"
                            secondaryText="Change your Google+ profile photo"
                            onClick={(evt: object) => {
                                onFieldChange({ field: "col2", value: "value-special" })
                            }}
                            leftIcon={<ActionStars />}
                        />
                    )}
                    {showNumericalInput && (
                        <ListItem
                            primaryText="Profile photo"
                            secondaryText="Change your Google+ profile photo"
                            leftIcon={<ActionInput />}
                            primaryTogglesNestedList={true}
                            nestedItems={[
                                <ListItem key={1} disabled={true}>
                                    <TextField hintText="Hint Text" />
                                    <RaisedButton
                                        label={"OK"}
                                        primary={true}
                                        onClick={(evt: object) => {
                                            onFieldChange({ field: "col2", value: "12" })
                                        }}
                                    />
                                </ListItem>,
                            ]}
                        />
                    )}
                    {showRelatedColumns && (
                        <ListItem
                            primaryText="Show your status"
                            secondaryText="Your status is visible to everyone you use with"
                            leftIcon={<ActionViewColumn />}
                            onClick={(evt: object) => {
                                onFieldChange({ field: "col2", value: { id: "foo" } })
                            }}
                        />
                    )}
                    {showRelatedColumns && (
                        <ListItem
                            primaryText="Profile photo"
                            secondaryText="Change your Google+ profile photo"
                            leftIcon={<ActionViewColumn />}
                            onClick={(evt: object) => {
                                onFieldChange({ field: "col2", value: { id: "foo" } })
                            }}
                        />
                    )}
                    <ListItem disabled={true}>
                        <RaisedButton label={"Search For Data"} primary={true} fullWidth={true} onClick={onOpenDataBrowser} />
                    </ListItem>
                </List>
            </Popover>
        )
    }
}

export default ExpressionPartSelector
