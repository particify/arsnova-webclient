import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommentSettingsComponent } from './comment-settings.component';
import { MatDialog } from '@angular/material/dialog';
import {
  JsonTranslationLoader, MockEventService, MockGlobalStorageService,
  MockMatDialog,
  MockNotificationService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommentService } from '@arsnova/app/services/http/comment.service';
import { CommentSettingsService } from '@arsnova/app/services/http/comment-settings.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '@arsnova/app/services/util/event.service';
import { Room } from '@arsnova/app/models/room';
import { CommentSettings } from '@arsnova/app/models/comment-settings';
import { of } from 'rxjs';

@Injectable()
class MockRoomService {
}

@Injectable()
class MockCommentService {
}

@Injectable()
class MockCommentSettingsService {
  get() {
    return of(new CommentSettings())
  }
}

@Injectable()
class MockDialogService {
}

@Injectable()
class MockLiveAnnouncer {
}


describe('CommentSettingsComponent', () => {
  let component: CommentSettingsComponent;
  let fixture: ComponentFixture<CommentSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentSettingsComponent ],
      providers: [
        {
          provide: MatDialog,
          useClass: MockMatDialog
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: CommentService,
          useClass: MockCommentService
        },
        {
          provide: CommentSettingsService,
          useClass: MockCommentSettingsService
        },
        {
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: LiveAnnouncer,
          useClass: MockLiveAnnouncer
        },
        {
          provide: EventService,
          useClass: MockEventService
        }
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentSettingsComponent);
    component = fixture.componentInstance;
    component.room = new Room('1234', 'shortId', 'abbreviation', 'name', 'description');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
})
