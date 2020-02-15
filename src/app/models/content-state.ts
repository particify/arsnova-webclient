export class ContentState {
  round: number;
  additionalTextVisible: boolean;
  responsesEnabled: boolean;
  responsesVisible: boolean;
  visible: boolean;

  constructor(round: number,
              additionalTextVisible: boolean,
              responsesEnabled: boolean,
              responsesVisible: boolean,
              visible: boolean) {
    this.round = round;
    this.additionalTextVisible = additionalTextVisible;
    this.responsesEnabled = responsesEnabled;
    this.responsesVisible = responsesVisible;
    this.visible = visible;
  }
}
