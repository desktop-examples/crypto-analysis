import * as debug from "debug";
import * as moment from "moment";
import * as qs from "querystring";

import { IExchangeVolumeData } from "./iExchangeVolumeData";
import { IHistoricalPriceStore } from "./iHistoricalPriceStore";

const logger = debug("stock-chart:store:prices");

export class CryptoCompareHistoricalPriceStore implements IHistoricalPriceStore {

    private readonly basePriceUrl = "https://min-api.cryptocompare.com/data/histoday";
    private readonly exchanges = ["Bitfinex", "Bitstamp", "Coinbase", "Gemini", "Kraken"];
    private readonly symbolLength = 3;

    public async getExchangeVolumeData(symbol: string) {

        logger(`fetching all volumes from ${this.basePriceUrl}`);

        const base = symbol.slice(0, this.symbolLength);
        const term = symbol.slice(this.symbolLength);

        const querystring = qs.stringify({
            fsym: base,
            limit: 364,
            tsym: term,
        });

        return Promise
            .resolve(this.exchanges)
            .then(async (exchanges) => {

                const promises = exchanges
                    .map(async (exchange) => {

                        const priceUrl = `${this.basePriceUrl}?${querystring}&e=${exchange}`;

                        logger(`fetching volume data from ${priceUrl}`);

                        return fetch(priceUrl)
                            .then(async (response) => {
                                if (response.ok) {
                                    return response.json();
                                }

                                throw new Error(response.statusText);
                            })
                            .then((history: ICryptoCompareHistoricalData) => {
                                if (history.Response === "Success") {
                                    return history;
                                }

                                return undefined;
                            })
                            .then((history: ICryptoCompareHistoricalData | undefined) => {

                                if (history === undefined) {
                                    return [];
                                }

                                return history
                                    .Data
                                    .sort((a, b) => a.time - b.time)
                                    .map((price) => {
                                        const date = moment
                                            .unix(price.time)
                                            .toDate();

                                        const volume = price.volumeto - price.volumefrom;

                                        return {
                                            date,
                                            volume,
                                        };
                                    });
                            })
                            .then((volume: IVolumeData[]) => {
                                const volumeData: IExchangeVolumeData = {
                                    exchange,
                                    volume,
                                };

                                return volumeData;
                            });
                    });

                return Promise.all(promises);
            });
    }
}
