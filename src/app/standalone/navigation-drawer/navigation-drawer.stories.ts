import {
  NavButton,
  NavButtonSection,
  NavigationDrawerComponent,
} from './navigation-drawer.component';

import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { ActivatedRoute } from '@angular/router';

export default {
  component: NavigationDrawerComponent,
  title: 'NavigationDrawer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [NavigationDrawerComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { firstChild: { url: [{ path: 'path' }] } },
          },
        },
      ],
    }),

    componentWrapperDecorator(
      (story) =>
        `<div style="width: 100%; height: 64px" class="primary-background">This is a header</div>
        <div style="padding: 4vw;">${story}</div>`
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

type Story = StoryObj<NavigationDrawerComponent>;

export const NavigationDrawer: Story = {
  args: {
    buttonSections: [
      new NavButtonSection(
        [
          new NavButton('settings', 'Settings', 'settings'),
          new NavButton('list', 'List', 'list'),
          new NavButton('stream', 'Stream', 'stream'),
        ],
        'Navigation'
      ),
    ],
    parentRoute: '',
    showFooter: true,
    backgroundColor: 'background',
  },
};
