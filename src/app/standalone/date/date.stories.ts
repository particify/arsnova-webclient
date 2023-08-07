import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DateComponent } from '@app/standalone/date/date.component';

export default {
  component: DateComponent,
  title: 'DateComp',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot(), DateComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<DateComponent>;

export const DateComp: Story = {
  args: {
    timestamp: new Date(),
  },
};
