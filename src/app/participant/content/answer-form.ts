import { OutputRef } from '@angular/core';
import { Answer } from '@gql/generated/graphql';

export interface AnswerForm {
  readonly answerCreated: OutputRef<Answer>;
  submitAnswer(): void;
}
