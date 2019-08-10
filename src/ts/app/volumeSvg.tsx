import { scaleLinear, select } from "d3";
import * as React from "react";

import { IExchangeVolumeData } from "../stores/pricing/iExchangeVolumeData";

interface IVolumeSvgProps {
    readonly data: IExchangeVolumeData[];
    readonly height: number;
    readonly width: number;
}

export class VolumeSvg extends React.PureComponent<IVolumeSvgProps> {

    private readonly shortMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    private readonly surface: React.RefObject<SVGSVGElement>;

    public constructor(props: IVolumeSvgProps) {
        super(props);

        this.surface = React.createRef<SVGSVGElement>();
    }

    public componentDidUpdate() {

        const { data, height, width } = this.props;

        if (data.length === 0) {
            return;
        }

        const scale =
            scaleLinear()
                .domain([0, 250_000_000])
                .range([0, 25]);

        const monthList = new Set<string>();

        const volumeByMonthByExchange =
            data
                .map((exchange) => {
                    const volume =
                        exchange
                            .volume
                            .reduce((previous, current) => {

                                const scaled = scale(current.volume);

                                const monthIndex = current.date.getMonth();
                                const year = current.date.getFullYear();

                                const month = `${this.shortMonth[monthIndex]} ${year}`;

                                if (!previous.has(month)) {
                                    previous.set(month, []);
                                }

                                monthList.add(month);

                                previous
                                    .get(month)!
                                    .push(scaled);

                                return previous;
                            }, new Map<string, number[]>());

                    return {
                        name: exchange.exchange,
                        volume,
                    };
                });

        const exchangeNameWidth = 90;
        const horizontalSpacing = (width - exchangeNameWidth) / 13;
        const verticalSpacing = (height - 50) / volumeByMonthByExchange.length;

        const monthAxis =
            select(this.surface.current)
                .selectAll("text")
                .data(Array.from(monthList.values()))
                .enter()
                .append("text");

        monthAxis
            .text((d) => d)
            .attr("transform", (_, i) => `translate(${(i * horizontalSpacing) + 35}, 20)`)
            .attr("fill", "#ffe41d")
            .attr("font-size", 10);

        const exchanges =
            select(this.surface.current)
                .selectAll("g")
                .data(volumeByMonthByExchange)
                .enter()
                .append("g");

        exchanges
            .attr("transform", (_, i) => `translate(25, ${(i + 1) * verticalSpacing})`);

        exchanges
            .append("text")
            .text((d) => d.name)
            .attr("transform", () => `translate(${width - exchangeNameWidth}, 29)`)
            .attr("fill", "#4682B4")
            .attr("font-size", 10);

        const months =
            exchanges
                .selectAll("g")
                .data((d) => Array.from(d.volume.entries()))
                .enter()
                .append("g");

        months
            .attr("transform", (_, i) => `translate(${(i * horizontalSpacing)}, 0)`);

        const circles =
            months
                .selectAll("circle")
                .data((d) => d[1].filter((v) => v > 0.001))
                .enter()
                .append("circle");

        circles
            .attr("cx", 25)
            .attr("cy", 25)
            .attr("r", (d) => d)
            .attr("fill", "none")
            .attr("stroke", "#4682B4")
            .style("opacity", 0.5);
    }

    public render() {
        const { height, width } = this.props;

        return (
            <div style={{ height: "100%", width: "100%" }}>
                <svg
                    ref={this.surface}
                    height={height}
                    width={width} />
            </div>
        );
    }
}
