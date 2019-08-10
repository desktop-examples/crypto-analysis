import * as debug from "debug";
import * as moment from "moment";
import * as qs from "querystring";

import { ICryptoCompareExchanges } from "./iCryptoCompareExchanges";
import { IExchangeVolumeData } from "./iExchangeVolumeData";
import { IHistoricalPriceStore } from "./iHistoricalPriceStore";

const logger = debug("stock-chart:store:prices");

export class CryptoCompareHistoricalPriceStore implements IHistoricalPriceStore {

    private readonly basePriceUrl = "https://min-api.cryptocompare.com/data/histoday";
    private readonly exchangeUrl = "https://min-api.cryptocompare.com/data/all/exchanges";
    private readonly rateLimit = 20;
    private readonly symbolLength = 3;

    public async getExchangeVolumeData(symbol: string) {

        logger(`fetching all exchanges from ${this.exchangeUrl}`);

        const base = symbol.slice(0, this.symbolLength);
        const term = symbol.slice(this.symbolLength);

        const querystring = qs.stringify({
            fsym: base,
            limit: 364,
            tsym: term,
        });

        return fetch(this.exchangeUrl)
            .then(async (response) => {
                if (response.ok) {
                    return response.json();
                }

                throw new Error(response.statusText);
            })
            .then((exchangeData: ICryptoCompareExchanges) => {

                const exchanges: string[] = [];

                for (const exchange in exchangeData) {
                    if (exchangeData.hasOwnProperty(exchange)) {
                        const pairs = exchangeData[exchange];
                        const containsBase = Object
                            .keys(pairs)
                            .some((basePair) => basePair === base);
                        if (containsBase) {
                            const containsTerm = pairs[base].some((termPair) => termPair === term);
                            if (containsTerm) {
                                exchanges.push(exchange);
                            }
                        }
                    }
                }

                return exchanges
                    .sort((a, b) => {
                        if (a < b) {
                            return -1;
                        }
                        if (a > b) {
                            return 1;
                        }

                        return 0;
                    })
                    .slice(0, this.rateLimit);
            })
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

                                throw new Error(history.Message);
                            })
                            .then((history: ICryptoCompareHistoricalData) => {

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
