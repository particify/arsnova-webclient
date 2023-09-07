import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { TranslocoModule } from '@ngneat/transloco';
import { CommentService } from '@app/core/services/http/comment.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateCommentComponent } from './create-comment.component';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';

class MockCommentService {}
class MockNotificationService {}
class MockDialogService {}
class MockAnnounceService {}
class MockMatDialogRef {}
class MockGlobalStorageService {}

export default {
  component: CreateCommentComponent,
  title: 'CreateComment',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslocoModule,
        CreateCommentComponent,
        BrowserAnimationsModule,
      ],
      providers: [
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
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CreateCommentComponent>;

export const CreateComment: Story = {};
