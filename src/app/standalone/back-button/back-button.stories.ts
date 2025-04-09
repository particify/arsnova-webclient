import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BackButtonComponent } from './back-button.component';
import { ActivatedRoute } from '@angular/router';

export default {
  component: BackButtonComponent,
  title: 'BackButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [BackButtonComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<BackButtonComponent>;

export const BackButton: Story = {
  args: {
    text: 'Go back to room',
  },
};
