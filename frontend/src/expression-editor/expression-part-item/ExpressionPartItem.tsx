import * as React from "react"
import { IColumn } from "../../redux/modules/interfaces"

import { ListItem } from "material-ui/List"
import ActionViewColumn from "material-ui/svg-icons/action/view-column"
import ActionGroupWork from "material-ui/svg-icons/action/group-work"
import ActionInput from "material-ui/svg-icons/action/input"
import ActionStars from "material-ui/svg-icons/action/stars"
import AlertWarning from "material-ui/svg-icons/alert/warning"

export interface IProps {
    value: any
    disabled?: boolean
    onClick: Function
}

class ExpressionPartItem extends React.Component<IProps, {}> {
    render() {
        const { value, disabled, onClick } = this.props

        // @FIXME: Don't assume an integery string is not a column (they may not always start with letters)

        let listItemProps: any = {}
        if (/^\d+$/.test(value)) {
            listItemProps = {
                primaryText: value,
                secondaryText: "Your status is visible to everyone you use with",
                leftIcon: <ActionInput />,
                onClick: onClick,
            }
        } else if (value === "value-special") {
            listItemProps = {
                primaryText: "Value Special",
                secondaryText: "Your status is visible to everyone you use with",
                leftIcon: <ActionStars />,
                onClick: onClick,
            }
        } else if (value === "some-group") {
            listItemProps = {
                primaryText: "Some Group",
                secondaryText: "Your status is visible to everyone you use with",
                leftIcon: <ActionGroupWork />,
                onClick: onClick,
            }
        } else if (value && "id" in value) {
            listItemProps = {
                primaryText: `${value.metadata_json.type}, ${value.metadata_json.kind}`,
                secondaryText: "Your status is visible to everyone you use with",
                leftIcon: <ActionViewColumn />,
                onClick: onClick,
            }
        } else {
            listItemProps = {
                primaryText: "No data selected",
                secondaryText: "Click here to choose a data point",
                leftIcon: <AlertWarning />,
                onClick: onClick,
            }
        }

        listItemProps.disabled = disabled || false

        return <ListItem {...listItemProps} />
    }
}

export default ExpressionPartItem
