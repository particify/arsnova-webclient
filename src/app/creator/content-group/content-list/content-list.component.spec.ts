import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentListComponent } from './content-list.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService, MockRouter } from '@testing/test-helpers';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { of } from 'rxjs';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentGroup } from '@app/core/models/content-group';
import { Room } from '@app/core/models/room';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentState } from '@app/core/models/content-state';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';

@Injectable()
class MockContentService {
  getContentsByIds() {
    const content = new Content(
      '1',
      'subject',
      'body',
      [],
      ContentType.CHOICE,
      {}
    );
    content.state = new ContentState(1, new Date(), true);
    return of([content]);
  }

  getTypeIcons() {
    return new Map<ContentType, string>();
  }

  getAnswersDeleted() {
    return of('1234');
  }
}

@Injectable()
class MockContentGroupService {
  getByRoomIdAndName() {
    return of(new ContentGroup('roomId', 'name', [], true));
  }
}

@Injectable()
class MockAnnouncer {
  announce() {}
}

@Injectable()
class MockDialogService {}

describe('ContentListComponent', () => {
  let component: ContentListComponent;
  let fixture: ComponentFixture<ContentListComponent>;

  const a11yRenderedBodyPipe = new A11yRenderedBodyPipe();

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentListComponent, A11yIntroPipe, A11yRenderedBodyPipe],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnouncer,
        },
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: HotkeyService,
          UserActivation: mockHotkeyService,
        },
        {
          provide: A11yRenderedBodyPipe,
          useValue: a11yRenderedBodyPipe,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
      ],
      imports: [getTranslocoModule(), MatMenuModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentListComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    component.contentGroup = new ContentGroup('roomId', 'seriesName');
    component.contents = [];
    component.isModerator = false;
    component.contentGroupStats = [
      new ContentGroupStatistics('groupId', 'name', 0),
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
