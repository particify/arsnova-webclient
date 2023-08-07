import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CommentListBarComponent } from './comment-list-bar.component';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';

class MockHotkeyService {
  registerHotkey() {}
  unregisterHotkey() {}
}
class MockTrackingService {}

export default {
  component: CommentListBarComponent,
  title: 'CommentListBar',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslateModule.forRoot(),
        CommentListBarComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: TrackingService,
          useClass: MockTrackingService,
        },
        {
          provide: HotkeyService,
          useClass: MockHotkeyService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentListBarComponent>;

export const CommentListBar: Story = {};
