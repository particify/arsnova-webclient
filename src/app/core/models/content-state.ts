export class ContentState {
  round: number;
  answeringEndTime?: Date;
  answersPublished: boolean;

  constructor(
    round: number,
    answeringEndTime: Date | undefined,
    answersPublished: boolean
  ) {
    this.round = round;
    this.answeringEndTime = answeringEndTime;
    this.answersPublished = answersPublished;
  }
}
