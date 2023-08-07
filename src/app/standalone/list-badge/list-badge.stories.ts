import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

export default {
  component: ListBadgeComponent,
  title: 'ListBadge',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ListBadgeComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<ListBadgeComponent>;

export const ListBadge: Story = {
  args: {
    count: 42,
  },
};
