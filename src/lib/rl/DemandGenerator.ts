export class DemandGenerator {
  private baseDemand: number;
  private seasonality: number;
  private noise: number;

  constructor(baseDemand: number = 20, seasonality: number = 10, noise: number = 5) {
    this.baseDemand = baseDemand;
    this.seasonality = seasonality;
    this.noise = noise;
  }

  public getDemand(day: number): number {
    // Sine wave seasonality (30-day cycle)
    const seasonalFactor = Math.sin((day / 30) * 2 * Math.PI) * this.seasonality;
    
    // Random spikes (10% chance)
    const spike = Math.random() < 0.1 ? Math.random() * 50 : 0;
    
    // Gaussian-ish noise
    const randomNoise = (Math.random() - 0.5) * 2 * this.noise;
    
    const demand = Math.round(this.baseDemand + seasonalFactor + spike + randomNoise);
    return Math.max(0, demand);
  }

  // Used for RL observations
  public getForecast(day: number, horizon: number = 1): number {
    const forecasted = this.getDemand(day + horizon);
    // Add some "forecast error"
    const error = (Math.random() - 0.5) * 2 * (this.noise * 0.5);
    return Math.max(0, Math.round(forecasted + error));
  }
}
