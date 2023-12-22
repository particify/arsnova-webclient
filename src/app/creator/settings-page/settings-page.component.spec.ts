import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SettingsPageComponent } from './settings-page.component';
import { RoomService } from '@app/core/services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActivatedRouteStub,
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { EventService } from '@app/core/services/util/event.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';

@Injectable()
class MockRoomService {}

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    userRole: UserRole.EDITOR,
    room: new Room(),
  };
  snapshot.params = { settingsName: 'comments' };
  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPageComponent, A11yIntroPipe],
      providers: [
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
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
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
