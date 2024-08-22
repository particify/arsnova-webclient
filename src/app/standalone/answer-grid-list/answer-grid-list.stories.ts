import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { AnswerGridListComponent } from '@app/standalone/answer-grid-list/answer-grid-list.component';
import { TextStatistic } from '@app/core/models/text-statistic';

export default {
  component: AnswerGridListComponent,
  title: 'AnswerGridList',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AnswerGridListComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AnswerGridListComponent>;

const answers = [
  new TextStatistic('Answer 1', 5, '1'),
  new TextStatistic('Answer 2', 4, '2'),
  new TextStatistic('Answer 3', 2, '3'),
  new TextStatistic('Answer 4', 1, '4'),
  new TextStatistic('Answer 5', 1, '5'),
  new TextStatistic('Answer 6', 1, '6'),
];

export const AnswerGridList: Story = {
  args: {
    answers: answers,
    showCorrect: false,
    correctTerms: ['Answer 1', 'Answer 3'],
  },
};
