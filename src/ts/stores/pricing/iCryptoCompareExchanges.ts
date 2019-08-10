export interface ICryptoCompareExchanges {
    [key: string]: ICryptoCompareExchangePairs;
}

interface ICryptoCompareExchangePairs {
    [key: string]: string[];
}
