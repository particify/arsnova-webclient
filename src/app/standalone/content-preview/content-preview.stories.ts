import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { ContentPreviewComponent } from './content-preview.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ExtensionFactory } from '@projects/extension-point/src/public-api';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { of } from 'rxjs';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { ContentType } from '@app/core/models/content-type.enum';
import { Content } from '@app/core/models/content';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { ContentFlashcard } from '@app/core/models/content-flashcard';

class MockService {}

class MockFormattingService {
  postString(text: string) {
    return of({ html: `<p>${text}</p>` });
  }
}

class MockContentAnswerService {
  shuffleAnswerOptions(options: AnswerOption[]) {
    return options;
  }
}

export default {
  component: ContentPreviewComponent,
  title: 'ContentPreview',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentPreviewComponent],
      providers: [
        LikertScaleService,
        ExtensionFactory,
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockService,
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentPreviewComponent>;

const choiceContent = new ContentChoice();
choiceContent.body = 'This is a choice content.';
choiceContent.options = [
  new AnswerOption('answer 1'),
  new AnswerOption('answer 2'),
  new AnswerOption('answer 3'),
  new AnswerOption('answer 4'),
];

export const ContentPreviewChoice: Story = {
  args: {
    content: choiceContent,
    renderAnswersDynamically: false,
    showTitle: true,
  },
};

const likertContent = new ContentScale(LikertScaleTemplate.AGREEMENT, 5);
likertContent.body = 'This is a likert content.';

export const ContentPreviewLikert: Story = {
  args: {
    content: likertContent,
    renderAnswersDynamically: false,
    showTitle: true,
  },
};

const binaryContent = new ContentChoice();
binaryContent.format = ContentType.BINARY;
binaryContent.options = [new AnswerOption('Yes'), new AnswerOption('No')];
binaryContent.body = 'This is a binary content.';

export const ContentPreviewBinary: Story = {
  args: {
    content: binaryContent,
    renderAnswersDynamically: false,
    showTitle: true,
  },
};

const textContent = new Content();
textContent.format = ContentType.TEXT;
textContent.body = 'This is a text content.';

export const ContentPreviewText: Story = {
  args: {
    content: textContent,
    renderAnswersDynamically: false,
    showTitle: true,
  },
};

const wordcloudContent = new ContentWordcloud();
wordcloudContent.maxAnswers = 3;
wordcloudContent.body = 'This is a wordcloud content.';

export const ContentPreviewWordcloud: Story = {
  args: {
    content: wordcloudContent,
    renderAnswersDynamically: false,
    showTitle: true,
  },
};

const sortContent = new ContentChoice();
sortContent.format = ContentType.SORT;
sortContent.body = 'This is a sort content.';
sortContent.options = [
  new AnswerOption('answer 1'),
  new AnswerOption('answer 2'),
  new AnswerOption('answer 3'),
  new AnswerOption('answer 4'),
];

export const ContentPreviewSort: Story = {
  args: {
    content: sortContent,
    renderAnswersDynamically: true,
    showTitle: true,
  },
};

const prioContent = new ContentPrioritization();
prioContent.format = ContentType.PRIORITIZATION;
prioContent.body = 'This is a prioritization content.';
prioContent.options = [
  new AnswerOption('answer 1'),
  new AnswerOption('answer 2'),
  new AnswerOption('answer 3'),
  new AnswerOption('answer 4'),
];

export const ContentPreviewPrioritization: Story = {
  args: {
    content: prioContent,
    renderAnswersDynamically: true,
    showTitle: true,
  },
};

const slideContent = new Content();
slideContent.format = ContentType.SLIDE;
slideContent.body = 'This is a slide content.';

export const ContentPreviewSlide: Story = {
  args: {
    content: slideContent,
    renderAnswersDynamically: true,
    showTitle: true,
  },
};

const flashcardContent = new ContentFlashcard();
flashcardContent.format = ContentType.FLASHCARD;
flashcardContent.body = 'This is a flashcard content.';
flashcardContent.additionalText = 'This is the back.';

export const ContentPreviewFlashcard: Story = {
  args: {
    content: flashcardContent,
    renderAnswersDynamically: true,
    showTitle: true,
  },
};
