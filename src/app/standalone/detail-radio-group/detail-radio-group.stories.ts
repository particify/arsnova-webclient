import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import {
  DetailedRadioGroup,
  DetailRadioGroupComponent,
} from '@app/standalone/detail-radio-group/detail-radio-group.component';

export default {
  component: DetailRadioGroupComponent,
  title: 'DetailRadioGroup',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [DetailRadioGroupComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<DetailRadioGroupComponent>;

export const ContentStepInfo: Story = {
  args: {
    items: [
      new DetailedRadioGroup('1', 'First', 'First item description.', 'home'),
      new DetailedRadioGroup('2', 'Second', 'Second item description.', 'flag'),
      new DetailedRadioGroup('3', 'Third', 'Third item description.', 'done'),
      new DetailedRadioGroup(
        '4',
        'Fourth',
        'Fourth item description.',
        'cancel'
      ),
    ],
  },
};
