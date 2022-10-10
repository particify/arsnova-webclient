import { AnswerOption } from './answer-option';

export class AnswerWithPoints {
  answerOption: AnswerOption;
  points: number;

  constructor(answerOption: AnswerOption, points: number) {
    this.answerOption = answerOption;
    this.points = points;
  }
}
