export class UserSettings {
  contentAnswersDirectlyBelowChart: boolean;
  contentVisualizationUnitPercent: boolean;
  showContentResultsDirectly: boolean;

  constructor(contentAnswersDirectlyBelowChart = false, contentVisualizationUnitPercent = false, showContentResultsDirectly = false) {
    this.contentAnswersDirectlyBelowChart = contentAnswersDirectlyBelowChart;
    this.contentVisualizationUnitPercent = contentVisualizationUnitPercent;
    this.showContentResultsDirectly = showContentResultsDirectly;
  }
}