import { useState, useCallback, useRef } from 'react';
import { SupplyChainEnv } from '../lib/rl/Environment.ts';
import { QLearningAgent, EOQAgent, FixedReorderAgent, Agent } from '../lib/rl/Agent.ts';
import { DQNAgent } from '../lib/rl/DQNAgent.ts';
import { Config, State, BusinessMetrics } from '../lib/rl/types.ts';

const DEFAULT_CONFIG: Config = {
  holdingCostPerUnit: 0.5,
  stockoutCostPerUnit: 5.0,
  orderFixedCost: 50.0,
  orderVariableCost: 2.0,
  maxInventory: 200,
  leadTime: 3,
  episodeLength: 100
};

export function useSimulation() {
  const [env] = useState(() => new SupplyChainEnv(DEFAULT_CONFIG, ['ENTERPRISE_SKU_1']));
  const [dqnAgent] = useState(() => new DQNAgent());
  const [qAgent] = useState(() => new QLearningAgent(0.1));
  
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReward: 0,
    totalStockouts: 0,
    episode: 0,
    serviceLevel: 0
  });
  
  const [isTraining, setIsTraining] = useState(false);
  const trainingRef = useRef(false);

  const runEpisode = useCallback(async (agent: Agent, options: { updateRL?: boolean; isDQN?: boolean } = {}) => {
    const states = env.reset();
    let done = false;
    let episodeHistory = [];
    let episodeReward = 0;
    let episodeStockouts = 0;
    let totalDemand = 0;
    let totalSatisfied = 0;

    const sku = 'ENTERPRISE_SKU_1';
    let currentState = states[0];

    while (!done) {
      const action = agent.selectAction(currentState);
      const stepResult = env.step(sku, action);
      
      if (options.updateRL) {
        if (options.isDQN) {
            (agent as DQNAgent).remember(currentState, action, stepResult.reward, stepResult.nextState, stepResult.done);
            await (agent as DQNAgent).train();
        } else if ((agent as any).update) {
            (agent as any).update(currentState, action, stepResult.reward, stepResult.nextState);
        }
      }

      episodeReward += stepResult.reward;
      if (stepResult.info.stockoutCost > 0) episodeStockouts++;
      totalDemand += stepResult.info.demand;
      totalSatisfied += stepResult.info.satisfiedDemand;
      
      episodeHistory.push({
        day: currentState.day,
        inventory: currentState.inventory,
        demand: stepResult.info.demand,
        order: stepResult.info.orderPlaced,
        reward: stepResult.reward
      });

      currentState = stepResult.nextState;
      done = stepResult.done;
      env.nextDay();
    }

    const serviceLevel = totalDemand > 0 ? (totalSatisfied / totalDemand) * 100 : 100;

    return { 
        episodeHistory, 
        episodeReward, 
        episodeStockouts,
        serviceLevel
    };
  }, [env]);

  const train = useCallback(async (episodes: number = 200, useDQN: boolean = true) => {
    setIsTraining(true);
    trainingRef.current = true;
    
    const agent = useDQN ? dqnAgent : qAgent;

    for (let i = 0; i < episodes; i++) {
        if (!trainingRef.current) break;
        
        const result = await runEpisode(agent, { updateRL: true, isDQN: useDQN });
        
        setStats(prev => ({
            ...prev,
            episode: prev.episode + 1,
            totalReward: result.episodeReward,
            totalStockouts: result.episodeStockouts,
            serviceLevel: result.serviceLevel
        }));
        setHistory(result.episodeHistory);

        // UI Throttle
        if (i % 2 === 0) await new Promise(r => setTimeout(r, 1));
    }
    
    setIsTraining(false);
    trainingRef.current = false;
  }, [runEpisode, dqnAgent, qAgent]);

  const compare = useCallback(async () => {
    const fixedAgent = new FixedReorderAgent();
    const eoqAgent = new EOQAgent(25, DEFAULT_CONFIG.orderFixedCost, DEFAULT_CONFIG.holdingCostPerUnit, DEFAULT_CONFIG.leadTime);
    
    // Evaluation (greedy)
    dqnAgent.setEpsilon(0);
    qAgent.setEpsilon(0);
    
    const dqnRes = await runEpisode(dqnAgent);
    const qRes = await runEpisode(qAgent);
    const fixedRes = await runEpisode(fixedAgent);
    const eoqRes = await runEpisode(eoqAgent);

    return {
        dqn: dqnRes,
        q: qRes,
        fixed: fixedRes,
        eoq: eoqRes
    };
  }, [runEpisode, dqnAgent, qAgent]);

  return {
    history,
    stats,
    isTraining,
    train,
    compare,
    stopTraining: () => { trainingRef.current = false; setIsTraining(false); },
    getInsights: () => {
        const lastState = history.length > 0 ? {
            inventory: history[history.length-1].inventory,
            demandForecast: 25, // Mock forecast
            day: history.length
        } : null;
        return lastState ? dqnAgent.getActionInsights(lastState) : [];
    }
  };
}
