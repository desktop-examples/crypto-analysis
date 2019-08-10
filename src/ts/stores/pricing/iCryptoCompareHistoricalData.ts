interface ICryptoCompareOHLCPrice {
    time: number;
    volumefrom: number;
    volumeto: number;
}

interface ICryptoCompareHistoricalData {
    Data: ICryptoCompareOHLCPrice[];
    Message: string;
    Response: string;
}
