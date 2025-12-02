import { StockData } from "./StockData";

export interface AlphaVantageTopGainersLosersResponse {
  metadata: string;
  last_updated: string;
  top_gainers: StockData[];
  top_losers: StockData[];
  most_actively_traded: StockData[];
}