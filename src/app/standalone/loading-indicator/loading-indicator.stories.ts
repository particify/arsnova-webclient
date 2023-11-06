import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TranslocoRootModule } from '@app/transloco-root.module';
import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

export default {
  component: LoadingIndicatorComponent,
  title: 'LoadingIndicator',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LoadingIndicatorComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<LoadingIndicatorComponent>;

export const LoadingIndicator: Story = {
  args: {
    size: 40,
    height: '0',
  },
};
