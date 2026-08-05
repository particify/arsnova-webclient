export interface VisualizationData {
  labels: string[];
  datasets: VisualizationDataset[];
}

export interface VisualizationDataset {
  values: number[];
  colors?: string[];
  label?: string;
}
