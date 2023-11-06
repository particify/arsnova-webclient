import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { CommentService } from '@app/core/services/http/comment.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateCommentComponent } from './create-comment.component';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

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
      imports: [CreateCommentComponent, BrowserAnimationsModule],
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
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CreateCommentComponent>;

export const CreateComment: Story = {};
