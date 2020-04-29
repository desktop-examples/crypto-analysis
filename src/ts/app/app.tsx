import * as React from "react";

import { Analysis } from "./analysis";

export class App extends React.PureComponent {
    public render = () => {
        return (
            <>
                <Analysis />
                <div className="attribution" />
            </>
        );
    }
}
