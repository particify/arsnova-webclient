export class SurveyStarted {
  type: string;
  payload: Record<string, never>;

  constructor() {
    this.type = 'SurveyStarted';
    this.payload = {};
  }
}
