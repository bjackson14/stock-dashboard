import { StockData } from "./StockData";

export interface AlphaVantageResponse {
  metadata: string;
  lastUpdated: string;
  topGainers: StockData[];
  topLosers: StockData[];
  mostActivelyTraded: StockData[];
}