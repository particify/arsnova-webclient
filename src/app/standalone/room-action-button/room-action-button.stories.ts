import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RoomActionButtonComponent } from './room-action-button.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

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
      imports: [TranslateModule.forRoot(), RoomActionButtonComponent],
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
