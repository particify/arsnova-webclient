import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementService } from '@app/core/services/http/announcement.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Room } from '@app/core/models/room';
import { MockNotificationService } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { AnnouncementSettingsComponent } from './announcement-settings.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnnouncementSettingsComponent', () => {
  let component: AnnouncementSettingsComponent;
  let fixture: ComponentFixture<AnnouncementSettingsComponent>;

  const announcementService = jasmine.createSpyObj('AnnouncementService', [
    'getByRoomId',
    'delete',
    'update',
    'add',
  ]);
  announcementService.getByRoomId.and.returnValue(of([]));

  const dialogService = jasmine.createSpyObj('DialogService', [
    'openDeleteDialog',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnouncementSettingsComponent],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: AnnouncementService,
          useValue: announcementService,
        },
        {
          provide: DialogService,
          useValue: dialogService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementSettingsComponent);
    component = fixture.componentInstance;
    component.room = new Room();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
