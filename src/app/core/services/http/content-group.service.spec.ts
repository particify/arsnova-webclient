import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { configureTestModule } from '@testing/test.setup';
import {
  Content,
  ContentType,
  QuestionnaireType,
} from '@gql/generated/graphql';

function content(format: ContentType, hasCorrectAnswer: boolean): Content {
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
    hasAnswers: false,
    abstentionCount: 0,
    correctAnswerCount: null,
    position: 0,
  };
}

describe('ContentGroupService', () => {
  let service: ContentGroupService;

  const globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
    'getItem',
    'setItem',
  ]);

  beforeEach(() => {
    const testBed = configureTestModule(
      [],
      [
        ContentGroupService,
        {
          provide: GlobalStorageService,
          useValue: globalStorageService,
        },
      ]
    );
    service = testBed.inject(ContentGroupService);
  });

  describe('getContentFormatsOfQuestionnaireType', () => {
    it('returns every content type for Mixed, in the order offered', () => {
      expect(
        service.getContentFormatsOfQuestionnaireType(QuestionnaireType.Mixed)
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
        service.getContentFormatsOfQuestionnaireType(QuestionnaireType.Quiz)
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
        service.getContentFormatsOfQuestionnaireType(QuestionnaireType.Survey)
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
        service.getContentFormatsOfQuestionnaireType(
          QuestionnaireType.Flashcards
        )
      ).toEqual([ContentType.Flashcard, ContentType.Slide]);
    });
  });

  describe('isContentCompatibleWithQuestionnaireType', () => {
    it('accepts a flashcard in a Flashcards series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Flashcard, false),
          QuestionnaireType.Flashcards
        )
      ).toBeTrue();
    });

    it('accepts a slide in a Flashcards series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Slide, false),
          QuestionnaireType.Flashcards
        )
      ).toBeTrue();
    });

    it('rejects a choice content in a Flashcards series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Choice, false),
          QuestionnaireType.Flashcards
        )
      ).toBeFalse();
    });

    it('accepts a slide in a Quiz series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Slide, false),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('accepts a slide in a Survey series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Slide, false),
          QuestionnaireType.Survey
        )
      ).toBeTrue();
    });

    it('accepts a numeric content with a correct number in a Quiz series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Numeric, true),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('accepts a numeric content without a correct number in a Survey series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Numeric, false),
          QuestionnaireType.Survey
        )
      ).toBeTrue();
    });

    it('accepts a short answer content in a Quiz series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.ShortAnswer, true),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('rejects a short answer content in a Survey series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.ShortAnswer, true),
          QuestionnaireType.Survey
        )
      ).toBeFalse();
    });

    it('accepts a prioritization content in a Survey series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Prioritization, false),
          QuestionnaireType.Survey
        )
      ).toBeTrue();
    });

    it('rejects a prioritization content in a Quiz series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Prioritization, false),
          QuestionnaireType.Quiz
        )
      ).toBeFalse();
    });

    it('accepts a sort content in a Quiz series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Sort, true),
          QuestionnaireType.Quiz
        )
      ).toBeTrue();
    });

    it('rejects a sort content in a Survey series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Sort, true),
          QuestionnaireType.Survey
        )
      ).toBeFalse();
    });

    it('rejects a numeric content without a correct number in a Quiz series', () => {
      expect(
        service.isContentCompatibleWithQuestionnaireType(
          content(ContentType.Numeric, false),
          QuestionnaireType.Quiz
        )
      ).toBeFalse();
    });
  });
});
