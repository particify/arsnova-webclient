import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';

export default {
  component: FormattingToolbarComponent,
  title: 'FormattingToolbar',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslocoModule, FormattingToolbarComponent],
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
