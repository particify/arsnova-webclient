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
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';

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
  component: ContentWordcloudParticipantComponent,
  title: 'ContentWordcloudParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentWordcloudParticipantComponent],
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

type Story = StoryObj<ContentWordcloudParticipantComponent>;

const wordcloudContent = new ContentWordcloud(
  'roomId',
  'subject',
  'Text Content',
  [],
  ContentType.TEXT,
  3
);

export const Unanswered: Story = {
  args: {
    content: wordcloudContent,
  },
};

const wordcloudContentWithMoreMaxAnswers = new ContentWordcloud(
  'roomId',
  'subject',
  'Text Content',
  [],
  ContentType.TEXT,
  10
);

export const UnansweredMoreMaxAnswers: Story = {
  args: {
    content: wordcloudContentWithMoreMaxAnswers,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: wordcloudContent,
    isDisabled: true,
  },
};

const wordcloudAnswer = new MultipleTextsAnswer(
  'contentId',
  1,
  ContentType.WORDCLOUD
);
wordcloudAnswer.texts = ['abc', 'test'];

export const Answered: Story = {
  args: {
    content: wordcloudContent,
    answer: wordcloudAnswer,
    isDisabled: true,
  },
};
