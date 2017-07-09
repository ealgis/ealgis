import * as React from "react"
import ActionHome from "material-ui/svg-icons/action/home"
import ActionFeedback from "material-ui/svg-icons/action/feedback"
import ActionSpeakerNotes from "material-ui/svg-icons/action/speaker-notes"

export class Welcome extends React.Component<undefined, undefined> {
    render() {
        return (
            <div>
                <h2>
                    <ActionHome /> Welcome
                </h2>

                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies eros sed leo pharetra
                    eleifend. Fusce ut mollis felis. Mauris egestas non ante nec gravida. Donec sed ante vitae massa
                    aliquam euismod ac a mauris. Pellentesque et nisl quis elit imperdiet eleifend. Integer fermentum
                    aliquet odio, quis consequat dui facilisis eu. Ut porttitor in metus vel viverra. Nulla vel magna
                    facilisis, maximus nibh vel, elementum tortor. Nulla nibh nunc, venenatis quis luctus quis, porta
                    nec tortor. Nulla sagittis felis ligula, quis sagittis orci eleifend luctus. Maecenas porttitor
                    euismod aliquet. Nulla sit amet nisi nec nisi cursus scelerisque. Ut nec scelerisque dolor. Etiam
                    nec ligula mi. Donec gravida sapien eget risus lacinia, a placerat enim tristique.
                </p>

                <h2>
                    <ActionHome /> Welcome Back
                </h2>

                <p>
                    Donec hendrerit quam libero, vitae cursus magna scelerisque ac. Donec ullamcorper sit amet libero
                    porta ultricies. Aliquam pharetra dolor nec lacus blandit, vel ultricies lacus vehicula. Donec
                    rutrum imperdiet viverra. Proin ullamcorper lectus ac blandit rutrum. Integer efficitur nibh et
                    metus finibus, sit amet pellentesque nulla elementum. Mauris tincidunt laoreet ex, in interdum ipsum
                    dapibus in. Nam ut blandit ipsum. Sed vel lectus nunc.
                </p>

                <ul>
                    <li>Nullam nec diam et dolor luctus tristique in eu lorem.</li>
                    <li>Fusce maximus tellus enim, a pulvinar odio luctus vitae.</li>
                    <li>
                        Nullam convallis nec leo ut rhoncus. Nullam volutpat varius risus, ac finibus urna eleifend vel.
                    </li>
                    <li>Nulla finibus leo quis pharetra mattis.</li>
                    <li>Nunc ornare tellus fermentum leo rutrum dapibus id eget mi. Aliquam erat volutpat.</li>
                </ul>

                <h2>
                    <ActionFeedback /> Feedback
                </h2>

                <p>
                    Nullam lacinia eget dui in laoreet. Suspendisse gravida, velit sed mattis blandit, nisl felis
                    sodales magna, quis aliquet enim sem vitae elit. Maecenas sed viverra massa. Nulla lacinia ligula eu
                    venenatis ornare.
                </p>

                <h2>
                    <ActionSpeakerNotes /> Attribution
                </h2>

                <p>
                    When using Census data through EALGIS you will need to adhere to the ABS data attribution
                    requirements for the Census and ASGS data, as per the{" "}
                    <a href="https://creativecommons.org/licenses/by/2.5/au/" target="_blank">
                        Creative Commons (Attribution) license
                    </a>. More information:{" "}
                    <a
                        href="http://www.abs.gov.au/websitedbs/d3310114.nsf/Home/Attributing+ABS+Material"
                        target="_blank"
                    >
                        abs.gov.au - Attributing ABS material
                    </a>
                </p>
            </div>
        )
    }
}

export default Welcome
