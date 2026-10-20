import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentPreviewComponent } from './content-preview.component';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ExtensionFactory } from '@projects/extension-point/src/public-api';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ContentFormatData, ContentType } from '@gql/generated/graphql';

class MockService {}

class MockFormattingService {
  postString(text: string) {
    return of({ html: `<p>${text}</p>` });
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
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                room: {
                  id: 'id',
                },
              },
            },
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentPreviewComponent>;

const baseArgs = {
  body: 'My awesome content',
  renderAnswersDynamically: false,
  showTitle: true,
};

const choiceContentFormatData: ContentFormatData = {
  __typename: 'ChoiceContentFormatData',
  format: ContentType.Choice,
  multiple: false,
  correctOptionIndexes: [1],
  options: [
    {
      __typename: 'AnswerOption',
      label: 'A',
      labelRendered: '<p>A</p>',
    },
    {
      __typename: 'AnswerOption',
      label: 'B',
      labelRendered: '<p>B</p>',
    },
    {
      __typename: 'AnswerOption',
      label: 'C',
      labelRendered: '<p>C</p>',
    },
    {
      __typename: 'AnswerOption',
      label: 'D',
      labelRendered: '<p>D</p>',
    },
  ],
};

export const ContentPreviewChoice: Story = {
  args: {
    ...baseArgs,
    contentFormatData: choiceContentFormatData,
  },
};

const wordcloudContentFormatData: ContentFormatData = {
  __typename: 'WordcloudContentFormatData',
  format: ContentType.Wordcloud,
  maxAnswers: 3,
};

export const ContentPreviewWordcloud: Story = {
  args: {
    ...baseArgs,
    contentFormatData: wordcloudContentFormatData,
  },
};

export const ContentPreviewFlashcard: Story = {
  args: {
    ...baseArgs,
    body: 'What is the capital of **Australia**?',
    contentFormatData: {
      __typename: 'FlashcardContentFormatData',
      format: ContentType.Flashcard,
      answer: 'Canberra, not Sydney.',
    },
  },
};

export const ContentPreviewSlide: Story = {
  args: {
    ...baseArgs,
    body: '## Welcome\n\nA slide shows its body only.',
    contentFormatData: {
      __typename: 'SlideContentFormatData',
      format: ContentType.Slide,
    },
  },
};

export const ContentPreviewShortAnswer: Story = {
  args: {
    ...baseArgs,
    contentFormatData: {
      __typename: 'ShortAnswerContentFormatData',
      format: ContentType.ShortAnswer,
      correctTerms: ['Paris'],
    },
  },
};

export const ContentPreviewSort: Story = {
  args: {
    ...baseArgs,
    contentFormatData: {
      __typename: 'SortContentFormatData',
      format: ContentType.Sort,
      options: [
        { __typename: 'AnswerOption', label: 'Earth' },
        { __typename: 'AnswerOption', label: 'Mercury' },
        { __typename: 'AnswerOption', label: 'Mars' },
      ],
    },
  },
};

export const ContentPreviewText: Story = {
  args: {
    ...baseArgs,
    contentFormatData: {
      __typename: 'TextContentFormatData',
      format: ContentType.Text,
      answersPublished: false,
    },
  },
};
