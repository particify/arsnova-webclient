export class UserSettings {
  answersDirectlyBelowChart: boolean;
  visualizationUnitPercent: boolean;

  constructor(answersDirectlyBelowChart = false, visualizationUnitPercent = false) {
    this.answersDirectlyBelowChart = answersDirectlyBelowChart;
    this.visualizationUnitPercent = visualizationUnitPercent;
  }
}