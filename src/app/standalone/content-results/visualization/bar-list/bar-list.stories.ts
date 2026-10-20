import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BarListComponent } from './bar-list.component';

export default {
  component: BarListComponent,
  title: 'BarList',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [BarListComponent],
      providers: [{ provide: FormattingService, useValue: {} }],
    }),
  ],
} as Meta;

type Story = StoryObj<BarListComponent>;

const items = [
  { label: 'Recorded sessions', value: 940 },
  { label: 'More exercises', value: 620 },
  {
    label: '*Shorter* lectures',
    labelRendered: '<em>Shorter</em> lectures',
    value: 240,
  },
  { label: 'Fewer slides', value: 3 },
  { label: 'Longer breaks', value: 0 },
];

export const Absolute: Story = {
  args: { items },
};

export const Percent: Story = {
  args: { items, dataLabelMode: 'percent' },
};
