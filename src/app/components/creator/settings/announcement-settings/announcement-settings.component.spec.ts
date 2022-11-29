import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementService } from '@arsnova/app/services/http/announcement.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { Room } from '@arsnova/app/models/room';
import { MockNotificationService, JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AnnouncementSettingsComponent } from './announcement-settings.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnnouncementSettingsComponent', () => {
  let component: AnnouncementSettingsComponent;
  let fixture: ComponentFixture<AnnouncementSettingsComponent>;

  const announcementService = jasmine.createSpyObj('AnnouncementService', ['getByRoomId', 'delete', 'update', 'add']);
  announcementService.getByRoomId.and.returnValue(of([]));

  const dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog'])

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnouncementSettingsComponent ],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: AnnouncementService,
          useValue: announcementService
        },
        {
          provide: DialogService,
          useValue: dialogService
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

    fixture = TestBed.createComponent(AnnouncementSettingsComponent);
    component = fixture.componentInstance;
    component.room = new Room();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
