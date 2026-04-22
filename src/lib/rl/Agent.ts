import { State, Action } from './types.ts';

export interface Agent {
  name: string;
  selectAction(state: State): Action;
  update?(state: State, action: Action, reward: number, nextState: State): void;
}

// 1. Baseline: Fixed Reorder Point Policy
export class FixedReorderAgent implements Agent {
  public name = 'Fixed (R, Q)';
  private reorderPoint: number;
  private reorderQuantity: number;

  constructor(reorderPoint: number = 30, reorderQuantity: number = 50) {
    this.reorderPoint = reorderPoint;
    this.reorderQuantity = reorderQuantity;
  }

  public selectAction(state: State): Action {
    if (state.inventory <= this.reorderPoint) {
      return this.reorderQuantity;
    }
    return 0;
  }
}

// 2. Baseline: EOQ (Economic Order Quantity) Policy
export class EOQAgent implements Agent {
  public name = 'EOQ Policy';
  private eoq: number;
  private reorderPoint: number;

  constructor(avgDemand: number, setupCost: number, holdingCost: number, leadTime: number) {
    // Formula: sqrt(2 * D * S / H)
    this.eoq = Math.round(Math.sqrt((2 * avgDemand * setupCost) / holdingCost));
    // Simple reorder point: D * LeadTime
    this.reorderPoint = Math.round(avgDemand * leadTime);
  }

  public selectAction(state: State): Action {
    if (state.inventory <= this.reorderPoint) {
      return this.eoq;
    }
    return 0;
  }
}

// 3. RL: Q-Learning Agent
export class QLearningAgent implements Agent {
  public name = 'Q-Learning RL';
  private qTable: Map<string, number[]>;
  private learningRate: number = 0.1;
  private discountFactor: number = 0.95;
  private epsilon: number = 0.1;
  private actions: number[] = [0, 10, 20, 30, 40, 50, 70, 100];

  constructor(epsilon: number = 0.1) {
    this.qTable = new Map();
    this.epsilon = epsilon;
  }

  private discretize(state: State): string {
    const invBin = Math.min(10, Math.floor(state.inventory / 10));
    const demandBin = Math.min(5, Math.floor(state.demandForecast / 10));
    return `${invBin}_${demandBin}`;
  }

  public selectAction(state: State): Action {
    const s = this.discretize(state);
    if (!this.qTable.has(s)) {
      this.qTable.set(s, new Array(this.actions.length).fill(0));
    }

    if (Math.random() < this.epsilon) {
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }

    const qValues = this.qTable.get(s)!;
    const maxQ = Math.max(...qValues);
    const bestActions = qValues
      .map((q, i) => (q === maxQ ? i : -1))
      .filter(i => i !== -1);
    
    return this.actions[bestActions[Math.floor(Math.random() * bestActions.length)]];
  }

  public update(state: State, action: Action, reward: number, nextState: State): void {
    const s = this.discretize(state);
    const ns = this.discretize(nextState);
    const actionIdx = this.actions.indexOf(action);

    if (!this.qTable.has(s)) this.qTable.set(s, new Array(this.actions.length).fill(0));
    if (!this.qTable.has(ns)) this.qTable.set(ns, new Array(this.actions.length).fill(0));

    const qValues = this.qTable.get(s)!;
    const nextQValues = this.qTable.get(ns)!;
    const maxNextQ = Math.max(...nextQValues);

    // Q-Learning update rule
    qValues[actionIdx] = qValues[actionIdx] + 
      this.learningRate * (reward + this.discountFactor * maxNextQ - qValues[actionIdx]);
  }

  public setEpsilon(ep: number) {
    this.epsilon = ep;
  }
}
