import * as React from "react";
import FlexView from "react-flexview";

import { SideBar } from "./sideBar";
import { VolumeAnalysis } from "./volumeAnalysis";

export class Analysis extends React.PureComponent {
    public render() {
        return (
            <FlexView grow shrink basis="100%">
                <SideBar />
                <VolumeAnalysis />
            </FlexView>
        );
    }
}
