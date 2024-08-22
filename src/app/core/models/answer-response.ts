import { Answer } from '@app/core/models/answer';
import { AnswerResult } from '@app/core/models/answer-result';

export interface AnswerResponse<T> {
  answer: Answer;
  answerResult: AnswerResult;
  correctnessCriteria: T;
}
