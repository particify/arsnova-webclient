export class UserSettings {
  contentAnswersDirectlyBelowChart: boolean;
  contentVisualizationUnitPercent: boolean;
  showContentResultsDirectly: boolean;
  rotateWordcloudItems: boolean;

  constructor(
    contentAnswersDirectlyBelowChart = false,
    contentVisualizationUnitPercent = true,
    showContentResultsDirectly = false,
    rotateWordcloutItems = true
  ) {
    this.contentAnswersDirectlyBelowChart = contentAnswersDirectlyBelowChart;
    this.contentVisualizationUnitPercent = contentVisualizationUnitPercent;
    this.showContentResultsDirectly = showContentResultsDirectly;
    this.rotateWordcloudItems = rotateWordcloutItems;
  }
}
