import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupPageComponent } from './content-group-page.component';
import { Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentState } from '@app/core/models/content-state';
import { of } from 'rxjs';
import { ContentGroup } from '@app/core/models/content-group';
import { Room } from '@app/core/models/room';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import {
  ActivatedRouteStub,
  MockFeatureFlagService,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import { ContentService } from '@app/core/services/http/content.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoomService } from '@app/core/services/http/room.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { UserRole } from '@app/core/models/user-roles.enum';

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
class MockRoomService {}

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
class MockRoomStatsService {
  getStats() {
    return of({});
  }
}

@Injectable()
class MockDialogService {}

@Injectable()
class MockLocalFileService {}

@Injectable()
class MockTrackingService {}

describe('ContentGroupPageComponent', () => {
  let component: ContentGroupPageComponent;
  let fixture: ComponentFixture<ContentGroupPageComponent>;

  const snapshot = new ActivatedRouteSnapshot();
  const params = {
    seriesName: 'SERIES',
  };

  snapshot.params = params;
  snapshot.data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
    userRole: UserRole.EDITOR,
  };

  const activatedRouteStub = new ActivatedRouteStub(
    params,
    undefined,
    snapshot
  );

  const a11yRenderedBodyPipe = new A11yRenderedBodyPipe();

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockAuthService = jasmine.createSpyObj(AuthenticationService, [
    'getCurrentAuthentication',
  ]);
  mockAuthService.getCurrentAuthentication.and.returnValue(
    of(
      new ClientAuthentication(
        'userId',
        'loginId',
        AuthProvider.ARSNOVA,
        'token'
      )
    )
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ContentGroupPageComponent,
        A11yIntroPipe,
        A11yRenderedBodyPipe,
      ],
      imports: [CoreModule, getTranslocoModule()],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: RoomStatsService,
          useClass: MockRoomStatsService,
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
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: LocalFileService,
          useClass: MockLocalFileService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: A11yRenderedBodyPipe,
          useValue: a11yRenderedBodyPipe,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
        {
          provide: TrackingService,
          useClass: MockTrackingService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentGroupPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
