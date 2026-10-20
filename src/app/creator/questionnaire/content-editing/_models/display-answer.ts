export class DisplayAnswer {
  option: string;
  correct: boolean;

  constructor(option: string, correct: boolean) {
    this.option = option;
    this.correct = correct;
  }
}
