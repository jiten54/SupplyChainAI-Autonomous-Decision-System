export interface State {
  inventory: number;
  demandForecast: number;
  day: number;
  skuId?: string;
}

export interface BusinessMetrics {
  totalHoldingCost: number;
  totalStockoutCost: number;
  totalOrderCost: number;
  serviceLevel: number; // % demand fulfilled
  stockoutFrequency: number; // % days with stockout
  totalCost: number;
}

export interface StepResult {
  nextState: State;
  reward: number;
  done: boolean;
  info: {
    demand: number;
    holdingCost: number;
    stockoutCost: number;
    orderCost: number;
    orderPlaced: number;
    satisfiedDemand: number;
  };
}

export interface Config {
  holdingCostPerUnit: number;
  stockoutCostPerUnit: number;
  orderFixedCost: number;
  orderVariableCost: number;
  maxInventory: number;
  leadTime: number;
  episodeLength: number;
}

export type Action = number;
