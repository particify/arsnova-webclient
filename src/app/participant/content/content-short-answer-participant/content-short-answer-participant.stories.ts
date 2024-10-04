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
import { ContentShortAnswerParticipantComponent } from '@app/participant/content/content-short-answer-participant/content-short-answer-participant.component';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';
import { ShortAnswerAnswer } from '@app/core/models/short-answer-answer';
import { ContentService } from '@app/core/services/http/content.service';

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

class MockContentService {
  getCorrectTerms() {
    return of(['a', 'b', 'c']);
  }
}

export default {
  component: ContentShortAnswerParticipantComponent,
  title: 'ContentShortAnswerParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentShortAnswerParticipantComponent],
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
          provide: ContentService,
          useClass: MockContentService,
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

type Story = StoryObj<ContentShortAnswerParticipantComponent>;

const shortAnswerContent = new ContentShortAnswer(
  'roomId',
  'subject',
  'Short answer Content',
  [],
  ['a', 'b', 'c'],
  ContentType.SHORT_ANSWER
);

export const Unanswered: Story = {
  args: {
    content: shortAnswerContent,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: shortAnswerContent,
    isDisabled: true,
  },
};

export const Answered: Story = {
  args: {
    content: shortAnswerContent,
    answer: new ShortAnswerAnswer('contentId', 1, 'a'),
    isDisabled: true,
  },
};

export const AnsweredCorrect: Story = {
  args: {
    content: shortAnswerContent,
    answer: new ShortAnswerAnswer('contentId', 1, 'a'),
    isDisabled: true,
    correctOptionsPublished: true,
    isCorrect: true,
  },
};

export const AnsweredWrong: Story = {
  args: {
    content: shortAnswerContent,
    answer: new ShortAnswerAnswer('contentId', 1, 'abc'),
    isDisabled: true,
    correctOptionsPublished: true,
    isCorrect: false,
  },
};
