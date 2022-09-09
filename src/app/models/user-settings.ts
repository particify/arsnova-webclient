export class UserSettings {
  answersDirectlyBelowChart: boolean;
  visualizationUnitPercent: boolean;
  showResultsDirectly: boolean;

  constructor(answersDirectlyBelowChart = false, visualizationUnitPercent = false, showResultsDirectly = false) {
    this.answersDirectlyBelowChart = answersDirectlyBelowChart;
    this.visualizationUnitPercent = visualizationUnitPercent;
    this.showResultsDirectly = showResultsDirectly;
  }
}