import {
  answerResultIcon,
  shuffleOptions,
} from '@app/core/utils/answer-options';
import { AnswerResultState } from '@gql/generated/graphql';

describe('answerResultIcon', () => {
  it('shows a check for a correct answer', () => {
    expect(answerResultIcon(AnswerResultState.Correct)).toBe('check');
  });

  it('shows a cross for a wrong answer', () => {
    expect(answerResultIcon(AnswerResultState.Wrong)).toBe('close');
  });

  it('shows a dash for an unanswered content', () => {
    expect(answerResultIcon(AnswerResultState.Unanswered)).toBe(
      'horizontal_rule'
    );
  });

  it('shows a dot for any other state', () => {
    expect(answerResultIcon(AnswerResultState.Neutral)).toBe(
      'fiber_manual_record'
    );
    expect(answerResultIcon()).toBe('fiber_manual_record');
  });
});

describe('shuffleOptions', () => {
  it('shuffles in place and returns the same array', () => {
    const options = ['A', 'B', 'C'];
    expect(shuffleOptions(options)).toBe(options);
  });

  it('keeps every option', () => {
    expect(shuffleOptions(['A', 'B', 'C', 'D']).sort()).toEqual([
      'A',
      'B',
      'C',
      'D',
    ]);
  });

  it('moves every option away from its original position', () => {
    const random = spyOn(Math, 'random');
    for (const value of [0, 0.25, 0.5, 0.75, 0.99]) {
      random.and.returnValue(value);
      const shuffled = shuffleOptions([0, 1, 2, 3, 4]);
      expect(shuffled.filter((option, index) => option === index))
        .withContext(`Math.random() = ${value}`)
        .toEqual([]);
    }
  });

  it('leaves a single option and an empty list as they are', () => {
    expect(shuffleOptions(['A'])).toEqual(['A']);
    expect(shuffleOptions([])).toEqual([]);
  });
});
