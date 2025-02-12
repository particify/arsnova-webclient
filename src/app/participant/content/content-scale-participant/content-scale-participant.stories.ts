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
import { ContentScaleParticipantComponent } from '@app/participant/content/content-scale-participant/content-scale-participant.component';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { TranslocoService } from '@jsverse/transloco';

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

class MockTranslocoService {
  selectTranslate(key: string) {
    return of(key);
  }

  setActiveLang() {}
}

export default {
  component: ContentScaleParticipantComponent,
  title: 'ContentScaleParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentScaleParticipantComponent],
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
        LikertScaleService,
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
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

type Story = StoryObj<ContentScaleParticipantComponent>;

const agreementContent = new ContentScale(LikertScaleTemplate.AGREEMENT, 5);

export const Agreement: Story = {
  args: {
    content: agreementContent,
  },
};

export const DisabledAgreement: Story = {
  args: {
    content: agreementContent,
    isDisabled: true,
  },
};

const scaleAnswer = new ChoiceAnswer('contentId', 1, ContentType.SCALE);
scaleAnswer.selectedChoiceIndexes = [1];

export const AnsweredAgreement: Story = {
  args: {
    content: agreementContent,
    answer: scaleAnswer,
    isDisabled: true,
  },
};

const agreementContentWithFourOptions = new ContentScale(
  LikertScaleTemplate.AGREEMENT,
  4
);

export const AgreementWithFourOptions: Story = {
  args: {
    content: agreementContentWithFourOptions,
  },
};

const intensityContent = new ContentScale(LikertScaleTemplate.INTENSITY, 5);

export const Intensity: Story = {
  args: {
    content: intensityContent,
  },
};

const frequencyContent = new ContentScale(LikertScaleTemplate.FREQUENCY, 5);

export const Frequency: Story = {
  args: {
    content: frequencyContent,
  },
};

const difficultyContent = new ContentScale(LikertScaleTemplate.DIFFICULTY, 5);

export const Difficulty: Story = {
  args: {
    content: difficultyContent,
  },
};

const importanceContent = new ContentScale(LikertScaleTemplate.IMPORTANCE, 5);

export const Importance: Story = {
  args: {
    content: importanceContent,
  },
};

const levelContent = new ContentScale(LikertScaleTemplate.LEVEL, 5);

export const Level: Story = {
  args: {
    content: levelContent,
  },
};

const paceContent = new ContentScale(LikertScaleTemplate.PACE, 5);

export const Pace: Story = {
  args: {
    content: paceContent,
  },
};

const plusMinusContent = new ContentScale(LikertScaleTemplate.PLUS_MINUS, 5);

export const PlusMinus: Story = {
  args: {
    content: plusMinusContent,
  },
};

const pointsContent = new ContentScale(LikertScaleTemplate.POINTS, 5);

export const Points: Story = {
  args: {
    content: pointsContent,
  },
};

const probabilityContent = new ContentScale(LikertScaleTemplate.PROBABILITY, 5);

export const Probability: Story = {
  args: {
    content: probabilityContent,
  },
};

const qualityContent = new ContentScale(LikertScaleTemplate.QUALITY, 5);

export const Quality: Story = {
  args: {
    content: qualityContent,
  },
};

const emojiContent = new ContentScale(LikertScaleTemplate.EMOJI, 5);

export const Emoji: Story = {
  args: {
    content: emojiContent,
  },
};
