import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { FeatureCardComponent } from './feature-card.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

class MockHotkeyService {
  registerHotkey() {}
  unregisterHotkey() {}
}

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
          provide: HotkeyService,
          useClass: MockHotkeyService,
        },
        {
          provide: ActivatedRoute,
          useClass: MockActivatedRoute,
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
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
    state: true,
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
    state: false,
    stateText: 'Stopped',
    url: 'feedback',
    icon: 'thumbs_up_down',
    hotkey: '2',
    clickable: false,
  },
};
