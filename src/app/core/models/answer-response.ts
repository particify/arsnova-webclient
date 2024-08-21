import { Answer } from '@app/core/models/answer';
import { AnswerResult } from '@app/core/models/answer-result';

export interface AnswerResponse {
  answer: Answer;
  answerResult: AnswerResult;
  correctnessCriteria: object;
}
