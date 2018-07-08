import { ActionCode, ActionFeedback, ActionHome, ActionSpeakerNotes } from "material-ui/svg-icons"
import * as React from "react"
import { IConfig } from "../redux/modules/interfaces"
declare var Config: IConfig

export class Welcome extends React.Component<undefined, undefined> {
    render() {
        return (
            <React.Fragment>
                <h2>
                    <ActionHome /> Welcome to Ealgis
                </h2>

                <p>
                    Ealgis is an interactive data visualisation and exploration tool for Australian Bureau of Statistics Census data.<br />
                    <br />
                    Drawing inspiration from the idea{" "}
                    <em>
                        "What if we combined an advanced GIS system with the power and ease-of-use of Excel, all in a Google Maps-esque
                        interface?"
                    </em>". Ealgis puts sophisticated statistical and geospatial data visualisation and analysis tools in your hands.
                    Through a simple web-based data exploration tool, you're able to discover, combine, and create your own maps based of
                    any of the hundreds of thousands of data points in the Australian Census.
                </p>

                <h2>
                    <ActionFeedback /> Feedback
                </h2>

                <p>
                    We'd love to hear any feedback or suggestions you have about Ealgis - please don't hestiate to{" "}
                    <a href={`mailto:${Config["EALGIS_SITE_CONTACT_EMAIL"]}`}>get in touch</a>.
                </p>

                <h2>
                    <ActionSpeakerNotes /> Attribution
                </h2>

                <p>
                    When using Census data through Ealgis you will need to adhere to the ABS data attribution requirements for the Census
                    and ASGS data, as per the{" "}
                    <a href="https://creativecommons.org/licenses/by/2.5/au/" target="_blank">
                        Creative Commons (Attribution) license
                    </a>. More information:{" "}
                    <a href="http://www.abs.gov.au/websitedbs/d3310114.nsf/Home/Attributing+ABS+Material" target="_blank">
                        abs.gov.au - Attributing ABS material
                    </a>
                </p>

                <h2>
                    <ActionCode /> Contribute
                </h2>

                <p>
                    Ealgis has been developed by <a href="https://github.com/grahame">@grahame</a> and{" "}
                    <a href="https://github.com/keithamoss">@keithamoss</a> and is GPL-3.0 licensed.{" "}
                    <a href="https://github.com/ealgis/ealgis">Contributions</a> are extremely welcome!
                </p>
            </React.Fragment>
        )
    }
}

export default Welcome
