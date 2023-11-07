import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { LiveFeedbackComponent } from '@app/standalone/live-feedback/live-feedback.component';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

class MockHotkeyService {
  registerHotkey() {}
  unregisterHotkey() {}
}

class MockAnnounceService {}

export default {
  component: LiveFeedbackComponent,
  title: 'LiveFeedback',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LiveFeedbackComponent],
      providers: [
        {
          provide: HotkeyService,
          useClass: MockHotkeyService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
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

type Story = StoryObj<LiveFeedbackComponent>;

export const Feedback: Story = {
  args: {
    type: LiveFeedbackType.FEEDBACK,
    isClosed: false,
    fixedSize: false,
    data: [25, 45, 20, 10],
  },
};
