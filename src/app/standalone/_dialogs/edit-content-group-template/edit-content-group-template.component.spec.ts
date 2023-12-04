import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditContentGroupTemplateComponent } from './edit-content-group-template.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MockAnnounceService,
  MockMatDialogRef,
  MockNotificationService,
} from '@testing/test-helpers';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';

import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LanguageService } from '@app/core/services/util/language.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditContentGroupTemplateComponent', () => {
  let component: EditContentGroupTemplateComponent;
  let fixture: ComponentFixture<EditContentGroupTemplateComponent>;

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'updateContentGroupTemplate',
    'getTemplateTags',
  ]);
  mockBaseTemplateService.getTemplateTags.and.returnValue(of([]));

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'getIsoLanguages',
  ]);
  mockLangService.getIsoLanguages.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditContentGroupTemplateComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            template: new ContentGroupTemplate(
              'name',
              'description',
              'en',
              [],
              'licese'
            ),
          },
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: BaseTemplateService,
          useValue: mockBaseTemplateService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: LanguageService,
          useValue: mockLangService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(EditContentGroupTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
