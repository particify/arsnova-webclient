import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommentSettingsComponent } from './comment-settings.component';
import { MatDialog } from '@angular/material/dialog';
import {
  MockEventService,
  MockMatDialog,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { RoomService } from '@app/core/services/http/room.service';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommentService } from '@app/core/services/http/comment.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '@app/core/services/util/event.service';
import { Room } from '@app/core/models/room';
import { CommentSettings } from '@app/core/models/comment-settings';
import { of } from 'rxjs';

@Injectable()
class MockRoomService {}

@Injectable()
class MockCommentService {}

@Injectable()
class MockCommentSettingsService {
  get() {
    return of(new CommentSettings());
  }
}

@Injectable()
class MockLiveAnnouncer {}

describe('CommentSettingsComponent', () => {
  let component: CommentSettingsComponent;
  let fixture: ComponentFixture<CommentSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommentSettingsComponent],
      providers: [
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: CommentService,
          useClass: MockCommentService,
        },
        {
          provide: CommentSettingsService,
          useClass: MockCommentSettingsService,
        },
        {
          provide: LiveAnnouncer,
          useClass: MockLiveAnnouncer,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentSettingsComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
