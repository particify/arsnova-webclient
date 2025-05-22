import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';

export default {
  component: CopyUrlComponent,
  title: 'CopyUrl',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CopyUrlComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CopyUrlComponent>;

export const CopyUrl: Story = {
  args: {
    url: 'https://path-to-whatever',
  },
};
