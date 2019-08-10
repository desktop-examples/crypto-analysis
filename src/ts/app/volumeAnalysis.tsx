import * as debug from "debug";
import { observable, runInAction } from "mobx";
import { inject, observer } from "mobx-react";
import * as React from "react";
import FlexView from "react-flexview/lib";
import { SizeMe } from "react-sizeme";

import { IExchangeVolumeData } from "../stores/pricing/iExchangeVolumeData";
import { IHistoricalPriceStore } from "../stores/pricing/iHistoricalPriceStore";

import { VolumeSvg } from "./volumeSvg";

const logger = debug("stock-chart:component:volumeAnalysis");

interface IVolumeAnalysisProps {
    historicalPriceStore?: IHistoricalPriceStore;
}

@inject("historicalPriceStore")
@observer
export class VolumeAnalysis extends React.Component<IVolumeAnalysisProps> {

    @observable
    private volume: IExchangeVolumeData[] = [];

    public componentDidMount() {
        this.props
            .historicalPriceStore!
            .getExchangeVolumeData("BTCUSD")
            .then((data) => {
                runInAction(() => {
                    this.volume = data;
                });
            })
            .catch((error) => {
                logger(error);
            });
    }

    public render() {
        const volume = this.volume.slice();

        return (
            <FlexView grow shrink basis="100%" className="analysis">
                <SizeMe monitorHeight monitorWidth refreshMode="debounce" refreshRate={500}>
                    {({ size }) => (
                        (size.width === null || size.height === null ? <div></div> :
                            <VolumeSvg
                                height={size.height}
                                width={size.width}
                                data={volume} />
                        )
                    )}
                </SizeMe>
            </FlexView>
        );
    }
}
