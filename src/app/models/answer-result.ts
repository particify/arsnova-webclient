export enum AnswerResultType {
  UNANSWERED = 'UNANSWERED',
  ABSTAINED = 'ABSTAINED',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
  NEUTRAL = 'NEUTRAL'
}

export interface AnswerResult {
  contentId: string;
  achievedPoints: number;
  maxPoints: number;
  state: AnswerResultType;
}

export class AnswerResultOverview {
  correctAnswerCount: number;
  scorableContentCount: number;
  achievedScore: number;
  maxScore: number;
  answerResults: AnswerResult[];
}