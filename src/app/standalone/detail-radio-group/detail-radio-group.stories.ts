import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import {
  DetailedRadioGroup,
  DetailRadioGroupComponent,
} from '@app/standalone/detail-radio-group/detail-radio-group.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';

export default {
  component: DetailRadioGroupComponent,
  title: 'DetailRadioGroup',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [DetailRadioGroupComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
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
