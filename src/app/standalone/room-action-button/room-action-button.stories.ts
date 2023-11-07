import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { RoomActionButtonComponent } from './room-action-button.component';
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
  component: RoomActionButtonComponent,
  title: 'RoomActionButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [RoomActionButtonComponent],
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

type Story = StoryObj<RoomActionButtonComponent>;

export const Comments: Story = {
  args: {
    feature: 'comments',
    icon: 'question_answer',
    hotkey: '1',
    badgeCounter: 42,
  },
};

export const LiveFeedback: Story = {
  args: {
    feature: 'live-feedback',
    url: 'feedback',
    icon: 'thumbs_up_down',
    hotkey: '2',
  },
};
