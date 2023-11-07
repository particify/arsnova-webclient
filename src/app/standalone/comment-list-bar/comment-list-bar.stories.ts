import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { CommentListBarComponent } from './comment-list-bar.component';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

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
      imports: [CommentListBarComponent],
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

type Story = StoryObj<CommentListBarComponent>;

export const CommentListBar: Story = {};
