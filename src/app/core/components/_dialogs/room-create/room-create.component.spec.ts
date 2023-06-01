import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoomCreateComponent } from './room-create.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  JsonTranslationLoader,
  MockMatDialogRef,
  MockNotificationService,
  MockGlobalStorageService,
  MockEventService,
  MockRouter,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RoomService } from '@app/core/services/http/room.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { EventService } from '@app/core/services/util/event.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { of } from 'rxjs';
import { MockMatDialogData } from '@testing/test-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RoomCreateComponent', () => {
  let component: RoomCreateComponent;
  let fixture: ComponentFixture<RoomCreateComponent>;

  const mockRoomService = jasmine.createSpyObj(['addRoom']);

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
  ]);
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of({}));

  const mockApiConfigService = jasmine.createSpyObj(['getApiConfig$']);
  const config = {
    authenticationProviders: [],
  };
  mockApiConfigService.getApiConfig$.and.returnValue(of(config));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoomCreateComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService,
        },
        {
          provide: MAT_DIALOG_DATA,
          useClass: MockMatDialogData,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
