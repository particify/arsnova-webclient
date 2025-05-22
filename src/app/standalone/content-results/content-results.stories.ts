import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ActivatedRoute } from '@angular/router';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentState } from '@app/core/models/content-state';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentType } from '@app/core/models/content-type.enum';
import {
  NumericRoundStatistics,
  PrioritizationRoundStatistics,
  RoundStatistics,
  TextRoundStatistics,
} from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { Content } from '@app/core/models/content';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TextAnswer } from '@app/core/models/text-answer';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';
import { ContentFlashcard } from '@app/core/models/content-flashcard';

class MockContentService {
  getAnswersDeleted() {
    return of('deletedContentId');
  }

  getRoundStarted() {
    return of();
  }

  hasFormatRounds() {
    return true;
  }

  private getChoiceStats() {
    const roundStatistics = new RoundStatistics(1, [1, 5, 2, 3], [], 0, 11);
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  private getMultipleChoiceStats() {
    const roundStatistics = new RoundStatistics(
      1,
      [6, 4, 5, 3],
      [
        { count: 1, selectedChoiceIndexes: [0] },
        { count: 1, selectedChoiceIndexes: [0, 1] },
        { count: 4, selectedChoiceIndexes: [0, 2] },
        { count: 1, selectedChoiceIndexes: [1, 2] },
        { count: 1, selectedChoiceIndexes: [1, 3] },
        { count: 2, selectedChoiceIndexes: [3] },
        { count: 1, selectedChoiceIndexes: [1] },
      ],
      0,
      11
    );
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  private getLikertStats() {
    const roundStatistics = new RoundStatistics(1, [4, 6, 3, 1, 2], [], 0, 16);
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  private getBinaryStats() {
    const roundStatistics = new RoundStatistics(1, [4, 12], [], 0, 16);
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  private getWordcloudStats() {
    const roundStatistics = new TextRoundStatistics(
      1,
      [2, 2, 3, 4, 1, 2, 6, 3],
      [],
      0,
      23,
      [
        'Test answer',
        'Another test answer',
        'TEST ANSWER',
        'ABCD',
        'ABCD',
        'abcd',
        'abc',
        '42',
        'test',
      ]
    );
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  getSortStats() {
    const roundStatistics = new RoundStatistics(
      1,
      [6, 4, 5, 3],
      [
        { count: 4, selectedChoiceIndexes: [0, 1, 2, 3] },
        { count: 1, selectedChoiceIndexes: [1, 0, 2, 3] },
        { count: 1, selectedChoiceIndexes: [2, 0, 1, 3] },
        { count: 1, selectedChoiceIndexes: [2, 3, 1, 2] },
        { count: 2, selectedChoiceIndexes: [0, 1, 2, 1] },
        { count: 1, selectedChoiceIndexes: [3, 0, 2, 1] },
        { count: 1, selectedChoiceIndexes: [2, 0, 3, 1] },
      ],
      0,
      11
    );
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  private getPrioritizationStats() {
    const roundStatistics = new PrioritizationRoundStatistics(
      1,
      [],
      [],
      0,
      11,
      [240, 420, 160, 280]
    );
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  private getNumericStats() {
    const roundStatistics = new NumericRoundStatistics(
      1,
      [1, 3, 1, 1, 1],
      [],
      0,
      7,
      [1, 42, 99, 24, 100],
      1,
      100,
      50,
      42,
      34.1634,
      1167.1428,
      0.4285
    );
    const stats = new AnswerStatistics();
    stats.contentId = '1234';
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  private getShortAnswerStats() {
    const roundStatistics = new TextRoundStatistics(
      1,
      [3, 6, 9, 4, 1, 2, 6],
      [],
      0,
      31,
      ['answer', 'abcd', 'abc', 'ab', 'acd', '42', 'test']
    );
    const stats = new AnswerStatistics();
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  getAnswer(roomId: string, contentId: string) {
    switch (contentId) {
      case 'singleChoiceContent': {
        return this.getChoiceStats();
      }
      case 'multipleChoiceContent': {
        return this.getMultipleChoiceStats();
      }
      case 'likertContent': {
        return this.getLikertStats();
      }
      case 'binaryContent': {
        return this.getBinaryStats();
      }
      case 'wordcloudContent': {
        return this.getWordcloudStats();
      }
      case 'sortContent': {
        return this.getSortStats();
      }
      case 'prioritizationContent': {
        return this.getPrioritizationStats();
      }
      case 'numericContent': {
        return this.getNumericStats();
      }
      case 'shortAnswerContent': {
        return this.getShortAnswerStats();
      }
    }
  }

  getTextAnswerCreatedStream() {
    return of();
  }

  getAnswersChangedStream() {
    return of();
  }

  getAnswerBanned() {
    return of();
  }
}

class MockContentAnswerService {
  getAnswers(roomId: string, contentId: string) {
    if (roomId) {
      switch (contentId) {
        case 'textContent': {
          return of([
            new TextAnswer('textContent', 1, 'Test answer'),
            new TextAnswer('textContent', 1, 'Another Test answer'),
            new TextAnswer('textContent', 1, 'TEST ANSWER'),
            new TextAnswer('textContent', 1, 'ABCD'),
            new TextAnswer('textContent', 1, 'ABCD'),
            new TextAnswer('textContent', 1, 'abcd'),
            new TextAnswer('textContent', 1, 'abc'),
            new TextAnswer('textContent', 1, '42'),
            new TextAnswer('textContent', 1, 'test'),
          ]);
        }
      }
    }
  }

  shuffleAnswerOptions(answers: AnswerOption[]): AnswerOption[] {
    return answers;
  }
}
class MockPresentationService {
  updateMultipleRoundState() {}

  getMultipleRoundState() {
    return of();
  }

  getContentState() {
    return of();
  }

  getRoundStateChanges() {
    return of();
  }

  getScale() {
    return 1;
  }
}

class MockFormattingService {
  postString(text: string) {
    return of(text);
  }
}

export default {
  component: ContentResultsComponent,
  title: 'ContentResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentResultsComponent],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: PresentationService,
          useClass: MockPresentationService,
        },

        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        LikertScaleService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                room: {
                  id: 'roomId',
                  name: 'My awesome room',
                  shortId: '12345678',
                  description: 'This is my awesome room description.',
                  settings: {},
                },
              },
            },
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentResultsComponent>;

const singleChoiceContent = new ContentChoice(
  'roomId',
  'subject',
  'Single Choice Content',
  [],
  [
    new AnswerOption('Answer 1'),
    new AnswerOption('Answer 2'),
    new AnswerOption('Answer 3'),
    new AnswerOption('Answer 4'),
  ],
  [1],
  false,
  ContentType.CHOICE
);
singleChoiceContent.id = 'singleChoiceContent';
singleChoiceContent.state = new ContentState(1, undefined, true);

export const SingleChoiceContentWith45PercentCorrect: Story = {
  args: {
    content: singleChoiceContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

export const SingleChoiceContentWith45PercentCorrectDirectShowCorrect: Story = {
  args: {
    content: singleChoiceContent,
    active: true,
    directShow: true,
    isPresentation: false,
    showCorrect: true,
  },
};

const multipleChoiceContent = new ContentChoice(
  'roomId',
  'subject',
  'Multiple Choice Content',
  [],
  [
    new AnswerOption('Answer 1'),
    new AnswerOption('Answer 2'),
    new AnswerOption('Answer 3'),
    new AnswerOption('Answer 4'),
  ],
  [0, 2],
  true,
  ContentType.CHOICE
);
multipleChoiceContent.id = 'multipleChoiceContent';
multipleChoiceContent.state = new ContentState(1, undefined, true);

export const MultipleChoiceContentWith36PercentCorrect: Story = {
  args: {
    content: multipleChoiceContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

export const MultipleChoiceContentWith36PercentCorrectDirectShowCorrect: Story =
  {
    args: {
      content: multipleChoiceContent,
      active: true,
      directShow: true,
      isPresentation: false,
      showCorrect: true,
    },
  };

const likertContent = new ContentScale(LikertScaleTemplate.AGREEMENT, 5);
likertContent.roomId = 'roomId';
likertContent.id = 'likertContent';
likertContent.state = new ContentState(1, undefined, true);
Object.defineProperty(likertContent, 'options', { value: undefined });

export const LikertContent: Story = {
  args: {
    content: likertContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

const binaryContent = new ContentChoice(
  'roomId',
  'subject',
  'Binary Content',
  [],
  [new AnswerOption('Yes'), new AnswerOption('No')],
  [1],
  false,
  ContentType.BINARY
);
binaryContent.id = 'binaryContent';
binaryContent.state = new ContentState(1, undefined, true);

export const BinaryContentWith75PercentCorrect: Story = {
  args: {
    content: binaryContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

export const BinaryContentWith75PercentCorrectDirectlyShowCorrect: Story = {
  args: {
    content: binaryContent,
    active: true,
    directShow: true,
    isPresentation: false,
    showCorrect: true,
  },
};

const textContent = new Content(
  'roomId',
  'subject',
  'Text content',
  [],
  ContentType.TEXT
);
textContent.id = 'textContent';
textContent.state = new ContentState(1, undefined, true);

export const TextContent: Story = {
  args: {
    content: textContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

const wordcloudContent = new ContentWordcloud(
  'roomId',
  'subject',
  'Wordcloud Content',
  [],
  ContentType.WORDCLOUD,
  3
);
wordcloudContent.id = 'wordcloudContent';
wordcloudContent.state = new ContentState(1, undefined, true);

// Known issues with the story "WordcloudContent": Results can only be displayed as list
export const WordcloudContent: Story = {
  args: {
    content: wordcloudContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

const sortContent = new ContentChoice(
  'roomId',
  'subject',
  'Sort Content',
  [],
  [
    new AnswerOption('Answer 1'),
    new AnswerOption('Answer 2'),
    new AnswerOption('Answer 3'),
    new AnswerOption('Answer 4'),
  ],
  [0, 1, 2, 3],
  false,
  ContentType.SORT
);
sortContent.id = 'sortContent';
sortContent.state = new ContentState(1, undefined, true);

export const SortContentWith36PercentCorrect: Story = {
  args: {
    content: sortContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

export const SortContentWith36PercentCorrectDirectlyShowCorrect: Story = {
  args: {
    content: sortContent,
    active: true,
    directShow: true,
    isPresentation: false,
    showCorrect: true,
  },
};

const prioritizationContent = new ContentPrioritization(
  'roomId',
  'subject',
  'Prioritization Content',
  [],
  [
    new AnswerOption('Answer 1'),
    new AnswerOption('Answer 2'),
    new AnswerOption('Answer 3'),
    new AnswerOption('Answer 4'),
  ],
  ContentType.PRIORITIZATION,
  100
);
prioritizationContent.id = 'prioritizationContent';
prioritizationContent.state = new ContentState(1, undefined, true);

export const PrioritizationContent = {
  args: {
    content: prioritizationContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

const numericContent = new ContentNumeric(
  'roomId',
  'subject',
  'Numeric Content',
  [],
  ContentType.NUMERIC,
  1,
  100,
  0
);
numericContent.id = 'numericContent';
numericContent.state = new ContentState(1, undefined, true);

export const NumericContent: Story = {
  args: {
    content: numericContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

const numericContentWithCorrect = new ContentNumeric(
  'roomId',
  'subject',
  'Numeric Content',
  [],
  ContentType.NUMERIC,
  1,
  100,
  0,
  42
);
numericContentWithCorrect.id = 'numericContent';
numericContentWithCorrect.state = new ContentState(1, undefined, true);

export const NumericContentWith43PercentCorrect: Story = {
  args: {
    content: numericContentWithCorrect,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

export const NumericContentWith43PercentCorrectDirectlyShowCorrect: Story = {
  args: {
    content: numericContentWithCorrect,
    active: true,
    directShow: true,
    isPresentation: false,
    showCorrect: true,
  },
};

const shortAnswerContent = new ContentShortAnswer(
  'roomId',
  'subject',
  'Short answer Content',
  [],
  ['abcd', 'abc'],
  ContentType.SHORT_ANSWER
);
shortAnswerContent.id = 'shortAnswerContent';
shortAnswerContent.state = new ContentState(1, undefined, true);

export const ShortanswerContentWith48PercentCorrect: Story = {
  args: {
    content: shortAnswerContent,
    active: true,
    directShow: true,
    isPresentation: false,
  },
};

export const ShortanswerContentWith48PercentCorrectDirectlyShowCorrect: Story =
  {
    args: {
      content: shortAnswerContent,
      active: true,
      directShow: true,
      isPresentation: false,
      showCorrect: true,
    },
  };

const slideContent = new Content(
  'roomId',
  'subject',
  'Slide Content',
  [],
  ContentType.SLIDE
);
slideContent.id = 'slideContent';
slideContent.state = new ContentState(1, undefined, true);

export const SlideContent: Story = {
  args: {
    content: slideContent,
    active: true,
    directShow: true,
  },
};

const flashcardContent = new ContentFlashcard(
  'roomId',
  'subject',
  'Flashcard content',
  'Back of flashcard',
  [],
  ContentType.FLASHCARD
);
flashcardContent.id = 'flashcardContent';
flashcardContent.state = new ContentState(1, undefined, true);

export const FlashcardContent: Story = {
  args: {
    content: flashcardContent,
    active: true,
    directShow: true,
  },
};
