import { Config, State, StepResult, Action, BusinessMetrics } from './types.ts';
import { DemandGenerator } from './DemandGenerator.ts';

export class SupplyChainEnv {
  private config: Config;
  private inventory: Map<string, number>;
  private day: number;
  private demandGenerators: Map<string, DemandGenerator>;
  private incomingOrders: Map<string, { dayToArrive: number; quantity: number }[]>;
  private skus: string[];

  constructor(config: Config, skus: string[] = ['SKU_A']) {
    this.config = config;
    this.skus = skus;
    this.inventory = new Map();
    this.demandGenerators = new Map();
    this.incomingOrders = new Map();
    
    this.initialize();
  }

  private initialize() {
    this.skus.forEach(sku => {
        this.inventory.set(sku, Math.floor(this.config.maxInventory / 2));
        this.demandGenerators.set(sku, new DemandGenerator());
        this.incomingOrders.set(sku, []);
    });
    this.day = 0;
  }

  public reset(): State[] {
    this.initialize();
    return this.skus.map(sku => this.getState(sku));
  }

  public step(sku: string, action: Action): StepResult {
    // 1. Process Order (Lead Time)
    if (action > 0) {
      const orders = this.incomingOrders.get(sku) || [];
      orders.push({
        dayToArrive: this.day + this.config.leadTime,
        quantity: action
      });
      this.incomingOrders.set(sku, orders);
    }

    // 2. Advance Day & Receive Incoming Orders (Sync day among all SKUs if needed, but for now single step per SKU)
    // Actually, in a multi-SKU environment, we usually step the whole world at once.
    // However, to keep RL simple, we'll allow stepping by SKU.
    
    let arrivedQuantity = 0;
    const orders = this.incomingOrders.get(sku) || [];
    const remainingOrders = orders.filter(order => {
      if (order.dayToArrive === this.day + 1) {
        arrivedQuantity += order.quantity;
        return false;
      }
      return true;
    });
    this.incomingOrders.set(sku, remainingOrders);

    let currentInv = (this.inventory.get(sku) || 0) + arrivedQuantity;

    // 3. Process Demand
    const demand = (this.demandGenerators.get(sku)!).getDemand(this.day + 1);
    const satisfiedDemand = Math.min(currentInv, demand);
    const stockout = Math.max(0, demand - currentInv);
    
    currentInv -= satisfiedDemand;
    this.inventory.set(sku, currentInv);

    // 4. Calculate Costs (Reward Components)
    const holdingCost = currentInv * this.config.holdingCostPerUnit;
    const stockoutCost = stockout * this.config.stockoutCostPerUnit;
    const orderCost = action > 0 
      ? this.config.orderFixedCost + (action * this.config.orderVariableCost)
      : 0;

    // Enterprise Reward Function: R = -(H + S + O)
    // Minimizing total cost is equivalent to maximizing this reward
    const reward = -(holdingCost + stockoutCost + orderCost);

    const done = this.day >= this.config.episodeLength;
    
    // Note: We don't increment this.day here if we step SKU by SKU.
    // We increment it when all SKUs have been updated for that day.
    
    return {
      nextState: this.getState(sku, this.day + 1),
      reward,
      done,
      info: {
        demand,
        holdingCost,
        stockoutCost,
        orderCost,
        orderPlaced: action,
        satisfiedDemand
      }
    };
  }

  public nextDay() {
    this.day++;
  }

  public getState(sku: string, day: number = this.day): State {
    return {
      inventory: this.inventory.get(sku) || 0,
      demandForecast: (this.demandGenerators.get(sku)!).getForecast(day),
      day,
      skuId: sku
    };
  }
}
