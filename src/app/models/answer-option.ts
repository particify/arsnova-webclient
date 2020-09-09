export class AnswerOption {
  label: string;
  renderedLabel: string;
  points: number;

  constructor(label: string, points: number) {
    this.label = label;
    this.points = points;
  }
}
