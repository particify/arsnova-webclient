import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { DateComponent } from '@app/standalone/date/date.component';

export default {
  component: DateComponent,
  title: 'DateComp',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslocoModule, DateComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<DateComponent>;

export const DateComp: Story = {
  args: {
    timestamp: new Date(),
  },
};
