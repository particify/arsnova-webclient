import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireScaleAnswerGql,
  ScaleContentTemplate,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentScaleParticipantComponent } from './content-scale-participant.component';

export default {
  component: ContentScaleParticipantComponent,
  title: 'ContentScaleParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentScaleParticipantComponent],
      providers: [
        LikertScaleService,
        {
          provide: FormattingService,
          useValue: { postString: (text: string) => of(text) },
        },
        {
          provide: CreateQuestionnaireScaleAnswerGql,
          useValue: { mutate: () => of({ data: {} }) },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentScaleParticipantComponent>;

const contentFormatData = (template: ScaleContentTemplate) => ({
  __typename: 'ScaleContentFormatData' as const,
  format: ContentType.Scale,
  template,
  neutralOption: true,
});

export const Agreement: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    language: 'en',
    contentFormatData: contentFormatData(ScaleContentTemplate.Agreement),
  },
};

export const Emoji: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    language: 'en',
    contentFormatData: contentFormatData(ScaleContentTemplate.Emoji),
  },
};

export const Answered: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    language: 'en',
    contentFormatData: contentFormatData(ScaleContentTemplate.Agreement),
    answerFormatData: {
      __typename: 'ScaleAnswerFormatData',
      format: ContentType.Scale,
      rating: 1,
    },
    result: AnswerResultState.Neutral,
  },
};
