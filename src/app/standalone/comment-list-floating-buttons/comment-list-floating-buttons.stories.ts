import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { CommentListFloatingButtonsComponent } from './comment-list-floating-buttons.component';

class MockHotkeyService {
  registerHotkey() {}
  unregisterHotkey() {}
}
class MockTrackingService {}

export default {
  component: CommentListFloatingButtonsComponent,
  title: 'CommentListFloatingButtons',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslateModule.forRoot(),
        CommentListFloatingButtonsComponent,
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

type Story = StoryObj<CommentListFloatingButtonsComponent>;

export const CommentListFloatingButtons: Story = {
  args: {
    showAddButton: true,
    showScrollButton: true,
    showScrollToNewPostsButton: true,
    addButtonDisabled: false,
    navBarExists: false,
  },
};
