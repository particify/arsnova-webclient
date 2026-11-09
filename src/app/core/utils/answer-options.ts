import { AnswerResultState } from '@gql/generated/graphql';

/** Shuffles in place and returns the same array. */
export function shuffleOptions<T>(options: T[]): T[] {
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = options[i];
    options[i] = options[j];
    options[j] = temp;
  }
  return options;
}

export function answerResultIcon(state?: AnswerResultState): string {
  switch (state) {
    case AnswerResultState.Correct:
      return 'check';
    case AnswerResultState.Wrong:
      return 'close';
    case AnswerResultState.Unanswered:
      return 'horizontal_rule';
    default:
      return 'fiber_manual_record';
  }
}
