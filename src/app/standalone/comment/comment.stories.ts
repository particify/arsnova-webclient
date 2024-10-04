import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { ActivatedRoute } from '@angular/router';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventEmitter, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';

class MockHotkeyService {
  unregisterHotkey() {}
}
class MockCommentService {}
class MockNotificationService {}
class MockDialogService {}
class MockLangService {
  langEmitter = new EventEmitter<string>();
}
class MockAnnounceService {}
class MockGlobalStorageService {
  getItem() {}
}

export default {
  component: CommentComponent,
  title: 'Comment',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentComponent, BrowserAnimationsModule],
      providers: [
        {
          provide: HotkeyService,
          useClass: MockHotkeyService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                room: { id: 'roomId' },
              },
            },
          },
        },
        {
          provide: CommentService,
          useClass: MockCommentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
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

type Story = StoryObj<CommentComponent>;

const standardComment = new Comment();
standardComment.id = 'commentId1';
standardComment.roomId = 'roomId';
standardComment.body = 'This is a comment body';
standardComment.timestamp = new Date();

export const StandardComment: Story = {
  args: {
    comment: standardComment,
    isEditor: true,
  },
};

const favoriteComment = new Comment();
favoriteComment.id = 'commentId2';
favoriteComment.roomId = 'roomId';
favoriteComment.body = 'This is a another comment which is a favorite';
favoriteComment.timestamp = new Date();
favoriteComment.favorite = true;

export const FavoriteComment: Story = {
  args: {
    comment: favoriteComment,
    isEditor: true,
  },
};
