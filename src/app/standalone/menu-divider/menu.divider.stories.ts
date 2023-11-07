import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { MenuDividerComponent } from '@app/standalone/menu-divider/menu-divider.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

export default {
  component: MenuDividerComponent,
  title: 'MenuDivider',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [MenuDividerComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<MenuDividerComponent>;

export const MenuDivider: Story = {
  args: {
    label: 'Label',
  },
};
