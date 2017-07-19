import * as React from "react"
import styled from "styled-components"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import { List, ListItem } from "material-ui/List"
import Subheader from "material-ui/Subheader"

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
`

const FirstFlexboxColumn = styled.div`flex: 0 0 12em;`

const SecondFlexboxColumn = styled.div`flex: 1;`

export interface IProps {
    onToggleDataBrowserModalState: any
    dataBrowserModalOpen: boolean
}

export class MapUINav extends React.Component<IProps, {}> {
    render() {
        const { onToggleDataBrowserModalState, dataBrowserModalOpen } = this.props

        const dialogActions = [
            <FlatButton label="Close" secondary={true} onTouchTap={onToggleDataBrowserModalState} />,
            <FlatButton label="Add" primary={true} onTouchTap={() => alert("@TODO Add dataset")} />,
        ]

        return (
            <div>
                <Dialog
                    title="Data Browser"
                    actions={dialogActions}
                    modal={true}
                    open={dataBrowserModalOpen}
                    contentStyle={{
                        width: "65%",
                        maxWidth: "none",
                        marginLeft: "25%",
                    }}
                >
                    <FlexboxContainer>
                        <FirstFlexboxColumn>
                            <List>
                                <ListItem primaryText="Discover" />
                                <ListItem primaryText="Popular" />
                            </List>
                        </FirstFlexboxColumn>

                        <SecondFlexboxColumn>Foobar.</SecondFlexboxColumn>
                    </FlexboxContainer>
                </Dialog>
            </div>
        )
    }
}

export default MapUINav
