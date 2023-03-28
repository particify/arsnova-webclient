import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoomComponent } from './room.component';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockLangService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { NotificationService } from '@core/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoomService } from '@core/services/http/room.service';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { DialogService } from '@core/services/util/dialog.service';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { EventService } from '@core/services/util/event.service';
import { LanguageService } from '@core/services/util/language.service';
import { FormattingService } from '@core/services/http/formatting.service';
import { UserRole } from '@core/models/user-roles.enum';

@Injectable()
class MockRoomService {}

@Injectable()
class MockDialogService {}

@Injectable()
class MockFormattingService {}

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    userRole: UserRole.OWNER,
  };

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoomComponent],
      providers: [
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
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
