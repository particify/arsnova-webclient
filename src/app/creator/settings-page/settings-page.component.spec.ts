import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SettingsPageComponent } from './settings-page.component';
import { RoomService } from '@app/core/services/http/room.service';
import { Router } from '@angular/router';
import {
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
import { Room } from '@app/core/models/room';

@Injectable()
class MockRoomService {}

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      imports: [getTranslocoModule(), SettingsPageComponent, A11yIntroPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    component.room = new Room();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
