import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireScaleContentGql,
  ScaleContentTemplate,
  UpdateQuestionnaireScaleContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ScaleContentFormComponent } from './scale-content-form.component';

const mutationMock = { mutate: () => of({ data: {} }) };

export default {
  component: ScaleContentFormComponent,
  title: 'ScaleContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ScaleContentFormComponent],
      providers: [
        LikertScaleService,
        { provide: FormattingService, useValue: {} },
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireScaleContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireScaleContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ScaleContentFormComponent>;

const formatData = (template: ScaleContentTemplate) => ({
  __typename: 'ScaleContentFormatData' as const,
  format: ContentType.Scale,
  template,
  neutralOption: true,
});

export const New: Story = {
  args: { formatData: null },
};

export const Agreement: Story = {
  args: {
    formatData: formatData(ScaleContentTemplate.Agreement),
    contentId: 'content-1',
  },
};

export const EmojiPreview: Story = {
  args: { formatData: formatData(ScaleContentTemplate.Emoji), preview: true },
};
