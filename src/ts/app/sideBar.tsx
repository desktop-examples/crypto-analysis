import * as React from "react";
import FlexView from "react-flexview";

export class SideBar extends React.PureComponent {
    private readonly width = 250;

    public render() {
        return (
            <FlexView column width={this.width} className="sidebar">
                <h5>BTCUSD</h5>
                <h2>Bitcoin</h2>
            </FlexView>
        );
    }
}
