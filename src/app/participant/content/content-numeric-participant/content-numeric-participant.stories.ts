import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { importProvidersFrom, EventEmitter } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LanguageService } from '@app/core/services/util/language.service';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { ENVIRONMENT } from '@environments/environment-token';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ApiConfig } from '@app/core/models/api-config';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { ContentNumericParticipantComponent } from '@app/participant/content/content-numeric-participant/content-numeric-participant.component';
import { NumericAnswer } from '@app/core/models/numeric-answer';

class MockService {}
class MockGlobalStorageService {
  getItem() {}
  setItem() {}
}

class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}));
  }
}

class MockFormattingService {}

class MockContentAnswerService {}

class MockLangService {
  langEmitter = new EventEmitter<string>();
  ensureValidLang(lang: string): string {
    return lang;
  }
}

export default {
  component: ContentNumericParticipantComponent,
  title: 'ContentNumericParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentNumericParticipantComponent],
      providers: [
        {
          provide: NotificationService,
          useClass: MockService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                apiConfig: { ui: {} },
                room: {
                  id: 'roomId',
                  name: 'My awesome room',
                  shortId: '12345678',
                  description: 'This is my awesome room description.',
                  settings: {},
                },
                contentGroup: new ContentGroup(
                  'roomId',
                  'My mixed series',
                  ['content1', 'content2', 'content3', 'content4'],
                  true,
                  true,
                  true,
                  PublishingMode.ALL,
                  0,
                  GroupType.MIXED,
                  false
                ),
              },
              params: {
                shortId: '12345678',
                seriesName: 'My mixed series',
              },
            },
          },
        },
      ],
    }),
    applicationConfig({
      providers: [
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
        },
        {
          provide: ENVIRONMENT,
          useValue: { features: [] },
        },
        provideAnimations(),
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentNumericParticipantComponent>;

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

export const Unanswered: Story = {
  args: {
    content: numericContent,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: numericContent,
    isDisabled: true,
  },
};

const numericAnswer = new NumericAnswer('contentId', 1, ContentType.NUMERIC);
numericAnswer.selectedNumber = 99;

export const Answered: Story = {
  args: {
    content: numericContent,
    answer: numericAnswer,
    isDisabled: true,
  },
};

const numericContentWithCorrect = new ContentNumeric(
  'roomId',
  'subject',
  'Numeric Content With Correct',
  [],
  ContentType.NUMERIC,
  1,
  100,
  0,
  42
);

const correctNumericAnswer = new NumericAnswer(
  'contentId',
  1,
  ContentType.NUMERIC
);
correctNumericAnswer.selectedNumber = 42;

export const AnsweredCorrectly: Story = {
  args: {
    content: numericContentWithCorrect,
    answer: correctNumericAnswer,
    correctOptionsPublished: true,
    isDisabled: true,
  },
};

const wrongNumericAnswer = new NumericAnswer(
  'contentId',
  1,
  ContentType.NUMERIC
);
wrongNumericAnswer.selectedNumber = 24;

export const AnsweredCWrong: Story = {
  args: {
    content: numericContentWithCorrect,
    answer: wrongNumericAnswer,
    correctOptionsPublished: true,
    isDisabled: true,
  },
};

const numericContentWithCorrectAndTolerance = new ContentNumeric(
  'roomId',
  'subject',
  'Numeric Content With Correct',
  [],
  ContentType.NUMERIC,
  1,
  100,
  2,
  42
);

const correctNumericAnswerWithTolerance = new NumericAnswer(
  'contentId',
  1,
  ContentType.NUMERIC
);
correctNumericAnswerWithTolerance.selectedNumber = 40;

export const AnsweredCorrectlyWithTolerance: Story = {
  args: {
    content: numericContentWithCorrectAndTolerance,
    answer: correctNumericAnswerWithTolerance,
    correctOptionsPublished: true,
    isDisabled: true,
  },
};
