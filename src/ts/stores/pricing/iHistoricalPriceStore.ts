import { IExchangeVolumeData } from "./iExchangeVolumeData";

export interface IHistoricalPriceStore {
    getExchangeVolumeData(symbol: string): Promise<IExchangeVolumeData[]>;
}
