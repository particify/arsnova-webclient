import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { CountComponent } from '@app/standalone/count/count.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';

export default {
  component: CountComponent,
  title: 'Count',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CountComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CountComponent>;

export const Count: Story = {
  args: {
    count: 42,
    label: 'answers',
  },
};
