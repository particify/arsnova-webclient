import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';

export default {
  component: FormattingToolbarComponent,
  title: 'FormattingToolbar',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FormattingToolbarComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<FormattingToolbarComponent>;

const inputElement = document.createElement('textarea');

export const FormattingToolbar: Story = {
  args: {
    inputElement: inputElement,
  },
};
