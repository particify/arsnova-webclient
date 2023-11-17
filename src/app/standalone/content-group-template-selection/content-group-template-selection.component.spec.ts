import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTemplateSelectionComponent } from './content-group-template-selection.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ActivatedRouteStub,
  MockAnnounceService,
  MockMatDialogRef,
  MockNotificationService,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { TemplateService } from '@app/creator/_services/template.service';
import { CoreModule } from '@app/core/core.module';
import { of } from 'rxjs';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LanguageService } from '@app/core/services/util/language.service';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { ContentGroupTemplatePreviewComponent } from '@app/standalone/content-group-template-preview/content-group-template-preview.component';
import { ContentGroupTemplateComponent } from '@app/standalone/content-group-template/content-group-template.component';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

describe('ContentGroupTemplateSelectionComponent', () => {
  let component: ContentGroupTemplateSelectionComponent;
  let fixture: ComponentFixture<ContentGroupTemplateSelectionComponent>;

  const mockAuthenticationService = jasmine.createSpyObj(
    AuthenticationService,
    ['getCurrentAuthentication']
  );
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(
    of(
      new ClientAuthentication(
        'userId',
        'loginId',
        AuthProvider.ARSNOVA,
        'token'
      )
    )
  );

  const mockTemplateService = jasmine.createSpyObj(TemplateService, [
    'getContentGroupTemplate',
    'getContentGroupTemplates',
  ]);
  mockTemplateService.getContentGroupTemplates.and.returnValue(
    of([
      new ContentGroupTemplate(
        'name',
        'description',
        'en',
        [],
        'CC0-1.0',
        false,
        'attribution name',
        ['1', '2', '3']
      ),
    ])
  );

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'getIsoLanguages',
  ]);
  mockLangService.getIsoLanguages.and.returnValue(of([]));

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'getContentTemplates',
    'getContentGroupTemplates',
    'getTemplateTags',
  ]);
  mockBaseTemplateService.getContentTemplates.and.returnValue(of([]));
  mockBaseTemplateService.getContentGroupTemplates.and.returnValue(of([]));
  mockBaseTemplateService.getTemplateTags.and.returnValue(of([]));

  const snapshot = new ActivatedRouteSnapshot();
  Object.defineProperty(snapshot, 'queryParams', {
    value: {},
  });
  Object.defineProperty(snapshot, 'params', {
    value: {},
  });
  const activatedRoute = new ActivatedRouteStub(undefined, undefined, snapshot);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ContentGroupTemplateSelectionComponent,
        CoreModule,
        BrowserAnimationsModule,
        getTranslocoModule(),
        TemplateLanguageSelectionComponent,
        TemplateTagSelectionComponent,
        ContentGroupTemplatePreviewComponent,
        ContentGroupTemplateComponent,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: LanguageService,
          useValue: mockLangService,
        },
        {
          provide: BaseTemplateService,
          useValue: mockBaseTemplateService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ContentGroupTemplateSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
