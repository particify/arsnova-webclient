import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { MenuDividerComponent } from '@app/standalone/menu-divider/menu-divider.component';

export default {
  component: MenuDividerComponent,
  title: 'MenuDivider',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslocoModule, MenuDividerComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<MenuDividerComponent>;

export const MenuDivider: Story = {
  args: {
    label: 'Label',
  },
};
