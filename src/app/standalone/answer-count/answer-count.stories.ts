import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { AnswerCountComponent } from './answer-count.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';

export default {
  component: AnswerCountComponent,
  title: 'AnswerCount',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AnswerCountComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AnswerCountComponent>;

export const AnswerCount: Story = {
  args: {
    count: 42,
  },
};
