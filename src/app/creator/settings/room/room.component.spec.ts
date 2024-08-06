import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoomComponent } from './room.component';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { RoomService } from '@app/core/services/http/room.service';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventService } from '@app/core/services/util/event.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { Room } from '@app/core/models/room';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';

@Injectable()
class MockRoomService {}

@Injectable()
class MockDialogService {}

@Injectable()
class MockFormattingService {}

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  const mockFocusModeService = jasmine.createSpyObj('FocusModeService', [
    'updateOverviewState',
  ]);

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
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    component.editRoom = new Room();
    component.name = 'Test room';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
