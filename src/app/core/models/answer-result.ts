export enum AnswerResultType {
  UNANSWERED = 'UNANSWERED',
  ABSTAINED = 'ABSTAINED',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
  NEUTRAL = 'NEUTRAL',
}

export interface AnswerResult {
  contentId: string;
  achievedPoints: number;
  maxPoints: number;
  state: AnswerResultType;
  duration?: number;
}

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class AnswerResultOverview {
  correctAnswerCount!: number;
  scorableContentCount!: number;
  achievedScore!: number;
  maxScore!: number;
  answerResults!: AnswerResult[];
}
