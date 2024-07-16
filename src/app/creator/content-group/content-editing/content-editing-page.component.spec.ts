import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentEditingPageComponent } from './content-editing-page.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { EventService } from '@app/core/services/util/event.service';
import { RoomService } from '@app/core/services/http/room.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import {
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockMatDialog,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { of } from 'rxjs';
import { ContentType } from '@app/core/models/content-type.enum';
import { Room } from '@app/core/models/room';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';

@Injectable()
class MockContentService {
  getTypeIcons() {
    return new Map<ContentType, string>([
      [ContentType.CHOICE, 'list'],
      [ContentType.SCALE, 'mood'],
      [ContentType.BINARY, 'rule'],
      [ContentType.TEXT, 'description'],
      [ContentType.WORDCLOUD, 'cloud'],
      [ContentType.SORT, 'move_up'],
      [ContentType.PRIORITIZATION, 'sort'],
      [ContentType.SLIDE, 'info'],
      [ContentType.FLASHCARD, 'school'],
    ]);
  }
}

@Injectable()
class MockNotificationService {}

@Injectable()
class MockEventService {}

@Injectable()
class MockRoomService {}

@Injectable()
class MockDialogService {}

@Injectable()
class MockContentGroupService {
  getContentFormatsOfGroupType() {
    return Object.values(ContentType);
  }
}

@Injectable()
class MockRoomStatsService {}
@Injectable()
class MockAnnouncer {}

@Injectable()
class MockFormattingService {}

describe('ContentEditingPageComponent', () => {
  let component: ContentEditingPageComponent;
  let fixture: ComponentFixture<ContentEditingPageComponent>;

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{ seriesName: 'SERIES' }]);
  snapshot.data = {
    room: new Room(),
    contentGroup: new ContentGroup(),
  };

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const contentPublishService = jasmine.createSpyObj(ContentPublishService, [
    'isGroupLive',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentEditingPageComponent, A11yIntroPipe],
      providers: [
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
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
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: RoomStatsService,
          useClass: MockRoomStatsService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: ContentPublishService,
          useValue: contentPublishService,
        },
      ],
      imports: [getTranslocoModule(), MatMenuModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentEditingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
