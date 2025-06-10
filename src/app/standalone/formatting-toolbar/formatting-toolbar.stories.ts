import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';

export default {
  component: FormattingToolbarComponent,
  title: 'FormattingToolbar',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FormattingToolbarComponent],
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
