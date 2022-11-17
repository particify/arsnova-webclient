import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AnnouncementState } from '@arsnova/app/models/announcement-state';
import { AnnouncementService } from '@arsnova/app/services/http/announcement.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { JsonTranslationLoader, MockMatDialogRef } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AnnouncementListComponent } from './announcement-list.component';

describe('AnnouncementListComponent', () => {
  let component: AnnouncementListComponent;
  let fixture: ComponentFixture<AnnouncementListComponent>;

  const dialogData = {
    state: new AnnouncementState()
  };

  const authService = jasmine.createSpyObj('AuthenticationService', ['getCurrentAuthentication']);
  authService.getCurrentAuthentication.and.returnValue(of({}));

  const announcementService = jasmine.createSpyObj('AnnouncementService', ['getByUserId']);
  announcementService.getByUserId.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnouncementListComponent ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: AuthenticationService,
          useValue: authService
        },
        {
          provide: AnnouncementService,
          useValue: announcementService
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

    fixture = TestBed.createComponent(AnnouncementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
