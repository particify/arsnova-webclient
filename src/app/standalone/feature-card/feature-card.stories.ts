import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { FeatureCardComponent } from './feature-card.component';
import { ActivatedRoute } from '@angular/router';

class MockActivatedRoute {}

export default {
  component: FeatureCardComponent,
  title: 'FeatureCard',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FeatureCardComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: MockActivatedRoute,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<FeatureCardComponent>;

export const Comments: Story = {
  args: {
    feature: 'Q&A',
    description: 'Description for Q&A feature.',
    countHint: '42 posts',
    stateText: 'Open',
    icon: 'question_answer',
    url: 'comments',
    hotkey: '1',
    clickable: true,
  },
};

export const LiveFeedback: Story = {
  args: {
    feature: 'Live Feedback',
    description: 'Description for Live Feedback feature.',
    countHint: '123 answers',
    stateText: 'Stopped',
    url: 'feedback',
    icon: 'thumbs_up_down',
    hotkey: '2',
    clickable: false,
  },
};
