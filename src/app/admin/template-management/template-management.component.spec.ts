import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateManagementComponent } from './template-management.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateService } from '@app/admin/template-management/template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { DialogService } from '@app/core/services/util/dialog.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LanguageService } from '@app/core/services/util/language.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TemplateManagementComponent', () => {
  let component: TemplateManagementComponent;
  let fixture: ComponentFixture<TemplateManagementComponent>;

  const mockTemplateService = jasmine.createSpyObj(TemplateService, [
    'patchTemplateTag',
    'deleteTemplateTag',
    'getTemplateTags',
  ]);
  const mockDialogService = jasmine.createSpyObj(DialogService, [
    'openDialog',
    'openDeleteDialog',
  ]);

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'getIsoLanguages',
  ]);
  mockLangService.getIsoLanguages.and.returnValue(of([]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateManagementComponent],
      imports: [
        BrowserAnimationsModule,
        getTranslocoModule(),
        TemplateLanguageSelectionComponent,
      ],
      providers: [
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: LanguageService,
          useValue: mockLangService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(TemplateManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
