import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentPresentationComponent } from './content-presentation.component';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import {
  ActivatedRouteStub, JsonTranslationLoader,
  MockEventService,
  MockLangService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { Location } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { Room } from '@arsnova/app/models/room';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { Content } from '@arsnova/app/models/content';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { PresentationService } from '@arsnova/app/services/util/presentation.service';
import { UserService } from '@arsnova/app/services/http/user.service';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { STORAGE_KEYS } from '@arsnova/app/services/util/global-storage.service';
import { UserSettings } from '@arsnova/app/models/user-settings';
import { StepperComponent } from '../../shared/stepper/stepper.component';


@Injectable()
class MockContentService {
  getContentsByIds() {
    return of([new Content('1234', '0', '1', 'subject', 'body', [], ContentType.CHOICE, {}, new ContentState(1, new Date(), true))]);
  }

  getSupportedContents(){
    return [];
  }
}

@Injectable()
class MockRoomService {
}

@Injectable()
class MockContentGroupService {
  getByRoomIdAndName() {
    return of(new ContentGroup('1234', '0', 'roomId', 'name', [], true));
  }
}

@Injectable()
class MockDialogService {
}

@Injectable()
class MockHotykeyService {
}

describe('ContentPresentationComponent', () => {
  let component: ContentPresentationComponent;
  let fixture: ComponentFixture<ContentPresentationComponent>;

  const data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description')
  }

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    isPresentation: false
  }

  snapshot.params = of([{seriesName: 'SERIES'}]);

  const activatedRouteStub = new ActivatedRouteStub(null,data, snapshot);

  const mockPresentationService = jasmine.createSpyObj(['getScale']);

  const mockUserService = jasmine.createSpyObj('UserService', ['getUserSettingsByLoginId']);
  mockUserService.getUserSettingsByLoginId.and.returnValue(of(new UserSettings()));

  const mockGlobalStorageService = jasmine.createSpyObj('GlobalStorageService', ['getItem', 'setItem']);
  mockGlobalStorageService.getItem.withArgs(STORAGE_KEYS.LANGUAGE).and.returnValue('de');
  mockGlobalStorageService.getItem.withArgs(STORAGE_KEYS.LAST_INDEX).and.returnValue(null);
  mockGlobalStorageService.getItem.withArgs(STORAGE_KEYS.LAST_GROUP).and.returnValue('series');
  mockGlobalStorageService.getItem.withArgs(STORAGE_KEYS.USER).and.returnValue(new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token'));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContentPresentationComponent,
        StepperComponent
      ],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: GlobalStorageService,
          useValue: mockGlobalStorageService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: Location,
          useClass: MockLocationStrategy
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: HotkeyService,
          useClass: MockHotykeyService
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService
        },
        {
          provide: UserService,
          useValue: mockUserService
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
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPresentationComponent);
    component = fixture.componentInstance;
    setTimeout(() => {
      fixture.detectChanges();
    }, 100);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
