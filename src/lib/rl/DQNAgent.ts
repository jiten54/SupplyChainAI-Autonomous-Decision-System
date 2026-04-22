import * as tf from '@tensorflow/tfjs';
import { State, Action, Agent } from './types.ts';

interface Experience {
  state: number[];
  actionIdx: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

export class DQNAgent implements Agent {
  public name = 'Deep Q-Network (DQN)';
  private mainModel: tf.LayersModel;
  private targetModel: tf.LayersModel;
  private memory: Experience[] = [];
  private memorySize: number = 2000;
  private batchSize: number = 32;
  private gamma: number = 0.95;
  private epsilon: number = 1.0;
  private epsilonMin: number = 0.01;
  private epsilonDecay: number = 0.995;
  private learningRate: number = 0.001;
  private updateTargetEvery: number = 5;
  private trainStep: number = 0;
  
  private actions: number[] = [0, 10, 20, 30, 40, 50, 75, 100];

  constructor() {
    this.mainModel = this.createModel();
    this.targetModel = this.createModel();
    this.updateTargetModel();
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 24, activation: 'relu', inputShape: [3] }));
    model.add(tf.layers.dense({ units: 24, activation: 'relu' }));
    model.add(tf.layers.dense({ units: this.actions.length, activation: 'linear' }));
    
    model.compile({
      optimizer: tf.train.adam(this.learningRate),
      loss: 'meanSquaredError'
    });
    
    return model;
  }

  private updateTargetModel() {
    this.targetModel.setWeights(this.mainModel.getWeights());
  }

  private stateToVector(state: State): number[] {
    // Normalize inputs for better NN stability
    return [
      state.inventory / 200,
      state.demandForecast / 100,
      state.day / 100
    ];
  }

  public selectAction(state: State): Action {
    if (Math.random() < this.epsilon) {
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }

    return tf.tidy(() => {
      const stateTensor = tf.tensor2d([this.stateToVector(state)]);
      const qValues = this.mainModel.predict(stateTensor) as tf.Tensor;
      const actionIdx = qValues.argMax(1).dataSync()[0];
      return this.actions[actionIdx];
    });
  }

  public remember(state: State, action: Action, reward: number, nextState: State, done: boolean) {
    this.memory.push({
      state: this.stateToVector(state),
      actionIdx: this.actions.indexOf(action),
      reward,
      nextState: this.stateToVector(nextState),
      done
    });

    if (this.memory.length > this.memorySize) {
      this.memory.shift();
    }
  }

  public async train() {
    if (this.memory.length < this.batchSize) return;

    const batch = this.sampleBatch();
    
    const states = tf.tensor2d(batch.map(e => e.state));
    const nextStates = tf.tensor2d(batch.map(e => e.nextState));
    
    const currentQValues = (this.mainModel.predict(states) as tf.Tensor).arraySync() as number[][];
    const nextQValues = (this.targetModel.predict(nextStates) as tf.Tensor).arraySync() as number[][];

    const x: number[][] = [];
    const y: number[][] = [];

    for (let i = 0; i < batch.length; i++) {
        const { actionIdx, reward, done } = batch[i];
        let target = reward;
        if (!done) {
            target += this.gamma * Math.max(...nextQValues[i]);
        }
        
        const qUpdate = [...currentQValues[i]];
        qUpdate[actionIdx] = target;
        
        x.push(batch[i].state);
        y.push(qUpdate);
    }

    const xTensor = tf.tensor2d(x);
    const yTensor = tf.tensor2d(y);

    await this.mainModel.fit(xTensor, yTensor, { epochs: 1, verbose: 0 });
    
    xTensor.dispose();
    yTensor.dispose();
    states.dispose();
    nextStates.dispose();

    this.trainStep++;
    if (this.trainStep % this.updateTargetEvery === 0) {
        this.updateTargetModel();
    }

    if (this.epsilon > this.epsilonMin) {
        this.epsilon *= this.epsilonDecay;
    }
  }

  private sampleBatch(): Experience[] {
    const indices = [];
    while (indices.length < this.batchSize) {
      const idx = Math.floor(Math.random() * this.memory.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    return indices.map(idx => this.memory[idx]);
  }

  public setEpsilon(ep: number) {
    this.epsilon = ep;
  }

  // Explainability insight: Return Q-values for current state
  public getActionInsights(state: State) {
    return tf.tidy(() => {
        const stateTensor = tf.tensor2d([this.stateToVector(state)]);
        const qValues = (this.mainModel.predict(stateTensor) as tf.Tensor).dataSync();
        return this.actions.map((a, i) => ({
            action: a,
            qValue: qValues[i]
        })).sort((a, b) => b.qValue - a.qValue);
    });
  }
}
