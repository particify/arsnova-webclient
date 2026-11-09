import {
  getAnswerOptions,
  getContentFormatsOfQuestionnaireType,
  isContentCompatibleWithQuestionnaireType,
} from '@app/core/utils/questionnaire-format';
import {
  ContentType,
  QuestionnaireType,
  ContentDetailsFragment,
} from '@gql/generated/graphql';

function content(
  format: ContentType,
  hasCorrectAnswer: boolean
): ContentDetailsFragment {
  return {
    __typename: 'Content',
    id: 'content-1',
    body: 'Body',
    bodyRendered: null,
    formatData: {
      __typename: 'ChoiceContentFormatData',
      format,
      options: [],
      correctOptionIndexes: null,
      multiple: false,
    },
    duration: null,
    abstentionsAllowed: false,
    hasCorrectAnswer,
    weight: null,
    answerCount: 0,
    abstentionCount: 0,
    position: 0,
    activeRound: null,
  };
}

describe('questionnaire format', () => {
  describe('getContentFormatsOfQuestionnaireType', () => {
    it('returns every content type for Mixed, in the order offered', () => {
      expect(
        getContentFormatsOfQuestionnaireType(QuestionnaireType.Mixed)
      ).toEqual([
        ContentType.Choice,
        ContentType.Scale,
        ContentType.Binary,
        ContentType.Text,
        ContentType.ShortAnswer,
        ContentType.Wordcloud,
        ContentType.Sort,
        ContentType.Prioritization,
        ContentType.Numeric,
        ContentType.Flashcard,
        ContentType.Slide,
      ]);
    });

    it('returns Choice, Binary, ShortAnswer, Sort, Numeric and Slide for Quiz', () => {
      expect(
        getContentFormatsOfQuestionnaireType(QuestionnaireType.Quiz)
      ).toEqual([
        ContentType.Choice,
        ContentType.Binary,
        ContentType.ShortAnswer,
        ContentType.Sort,
        ContentType.Numeric,
        ContentType.Slide,
      ]);
    });

    it('returns Choice, Scale, Binary, Text, Wordcloud, Prioritization, Numeric and Slide for Survey', () => {
      expect(
        getContentFormatsOfQuestionnaireType(QuestionnaireType.Survey)
      ).toEqual([
        ContentType.Choice,
        ContentType.Scale,
        ContentType.Binary,
        ContentType.Text,
        ContentType.Wordcloud,
        ContentType.Prioritization,
        ContentType.Numeric,
        ContentType.Slide,
      ]);
    });

    it('returns Flashcard and Slide for Flashcards', () => {
      expect(
        getContentFormatsOfQuestionnaireType(QuestionnaireType.Flashcards)
      ).toEqual([ContentType.Flashcard, ContentType.Slide]);
    });
  });

  describe('isContentCompatibleWithQuestionnaireType', () => {
    it('accepts a flashcard in a Flashcards series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Flashcard, false),
          QuestionnaireType.Flashcards
        )
      ).toBeTrue();
    });

    it('accepts a slide in a Flashcards series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Slide, false),
          QuestionnaireType.Flashcards
        )
      ).toBeTrue();
    });

    it('rejects a choice content in a Flashcards series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Choice, false),
          QuestionnaireType.Flashcards
        )
      ).toBeFalse();
    });

    it('accepts a slide in a Quiz series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Slide, false),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('accepts a slide in a Survey series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Slide, false),
          QuestionnaireType.Survey
        )
      ).toBeTrue();
    });

    it('accepts a numeric content with a correct number in a Quiz series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Numeric, true),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('accepts a numeric content without a correct number in a Survey series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Numeric, false),
          QuestionnaireType.Survey
        )
      ).toBeTrue();
    });

    it('accepts a short answer content in a Quiz series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.ShortAnswer, true),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('rejects a short answer content in a Survey series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.ShortAnswer, true),
          QuestionnaireType.Survey
        )
      ).toBeFalse();
    });

    it('accepts a prioritization content in a Survey series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Prioritization, false),
          QuestionnaireType.Survey
        )
      ).toBeTrue();
    });

    it('rejects a prioritization content in a Quiz series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Prioritization, false),
          QuestionnaireType.Quiz
        )
      ).toBeFalse();
    });

    it('accepts a sort content in a Quiz series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Sort, true),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('rejects a sort content in a Survey series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Sort, true),
          QuestionnaireType.Survey
        )
      ).toBeFalse();
    });

    it('rejects a numeric content without a correct number in a Quiz series', () => {
      expect(
        isContentCompatibleWithQuestionnaireType(
          content(ContentType.Numeric, false),
          QuestionnaireType.Quiz
        )
      ).toBeFalse();
    });
  });

  describe('getAnswerOptions', () => {
    it('marks the options at the correct indexes as correct', () => {
      expect(getAnswerOptions(['A', 'B', 'C'], [0, 2])).toEqual([
        jasmine.objectContaining({ option: 'A', correct: true }),
        jasmine.objectContaining({ option: 'B', correct: false }),
        jasmine.objectContaining({ option: 'C', correct: true }),
      ]);
    });

    it('marks no option as correct without correct indexes', () => {
      expect(
        getAnswerOptions(['A', 'B']).map((answer) => answer.correct)
      ).toEqual([false, false]);
    });
  });
});
