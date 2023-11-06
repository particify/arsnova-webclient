import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { CommentListFloatingButtonsComponent } from './comment-list-floating-buttons.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

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
      imports: [CommentListFloatingButtonsComponent],
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
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
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
