import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoomCreateComponent } from './room-create.component';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { JsonTranslationLoader,
  MockMatDialogRef,
  MockNotificationService,
  MockGlobalStorageService,
  MockLangService,
  MockEventService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ApiConfigService } from '@arsnova/app/services/http/api-config.service';
import { of } from 'rxjs';

describe('RoomCreateComponent', () => {
  let component: RoomCreateComponent;
  let fixture: ComponentFixture<RoomCreateComponent>;

  const mockRoomService = jasmine.createSpyObj(['addRoom']);

  const mockAuthenticationService = jasmine.createSpyObj(['getCurrentAuthentication']);
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of({}));

  const mockApiConfigService = jasmine.createSpyObj(['getApiConfig$']);
  const config = {
    authenticationProviders: []
  }
  mockApiConfigService.getApiConfig$.and.returnValue(of(config));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RoomCreateComponent
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
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
        },
        {
          provide: RoomService,
          useValue: mockRoomService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
