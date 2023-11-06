import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { DateComponent } from '@app/standalone/date/date.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

export default {
  component: DateComponent,
  title: 'DateComp',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [DateComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<DateComponent>;

export const DateComp: Story = {
  args: {
    timestamp: new Date(),
  },
};
