import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';

export default {
  component: ContentStepInfoComponent,
  title: 'ContentStepInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentStepInfoComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentStepInfoComponent>;

export const ContentStepInfo: Story = {
  args: {
    current: 1,
    totalCount: 5,
  },
};
