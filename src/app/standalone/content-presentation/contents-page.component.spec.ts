import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentsPageComponent } from './contents-page.component';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { UserService } from '@app/core/services/http/user.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import {
  ActivatedRouteStub,
  MockEventService,
  MockRouter,
} from '@testing/test-helpers';
import { SpyLocation } from '@angular/common/testing';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { Room } from '@app/core/models/room';
import { of } from 'rxjs';
import { UserSettings } from '@app/core/models/user-settings';
import { AuthProvider } from '@app/core/models/auth-provider';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { RoomService } from '@app/core/services/http/room.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { EventService } from '@app/core/services/util/event.service';

class MockContentService {
  getContentsByIds() {
    return of([new Content('1', 'subject', 'body', [], ContentType.CHOICE)]);
  }

  getSupportedContents(): Content[] {
    return [];
  }
}

class MockRoomService {}

class MockContentGroupService {
  getByRoomIdAndName() {
    return of(new ContentGroup('roomId', 'name', [], true));
  }
  patchContentGroup(group: ContentGroup) {
    return of(group);
  }
}

describe('ContentsPageComponent', () => {
  let component: ContentsPageComponent;
  let fixture: ComponentFixture<ContentsPageComponent>;

  const dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);

  const mockFocusModeService = jasmine.createSpyObj(['getContentState']);

  const mockPresentationService = jasmine.createSpyObj([
    'getScale',
    'updateContentGroup',
  ]);

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    isPresentation: false,
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  snapshot.params = of([{ seriesName: 'SERIES' }]);

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const mockUserService = jasmine.createSpyObj('UserService', [
    'getUserSettingsByLoginId',
  ]);
  mockUserService.getUserSettingsByLoginId.and.returnValue(
    of(new UserSettings())
  );

  const mockGlobalStorageService = jasmine.createSpyObj(
    'GlobalStorageService',
    ['getItem', 'setItem']
  );
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.LANGUAGE)
    .and.returnValue('de');
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.LAST_INDEX)
    .and.returnValue(null);
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.LAST_GROUP)
    .and.returnValue('series');
  mockGlobalStorageService.getItem
    .withArgs(STORAGE_KEYS.USER)
    .and.returnValue(
      new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token')
    );
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContentsPageComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
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
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: DialogService,
          useValue: dialogService,
        },
        {
          provide: GlobalStorageService,
          useValue: mockGlobalStorageService,
        },
        {
          provide: Location,
          useClass: SpyLocation,
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
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        ContentPublishService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ContentsPageComponent);
    component = fixture.componentInstance;
    component.contentGroup = new ContentGroup();
    component.contentGroup.contentIds = ['0', '1', '2', '3', '4', '5', '6'];
    setTimeout(() => {
      fixture.detectChanges();
    }, 100);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
