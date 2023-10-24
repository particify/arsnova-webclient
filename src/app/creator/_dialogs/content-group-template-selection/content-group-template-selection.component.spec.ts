import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTemplateSelectionComponent } from './content-group-template-selection.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
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
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContentGroupTemplateComponent } from '@app/standalone/content-group-template/content-group-template.component';

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
    'createCopyFromContentGroupTemplate',
    'getContentGroupTemplates',
  ]);
  mockTemplateService.getContentGroupTemplates.and.returnValue(
    of([
      new ContentGroupTemplate('name', 'description', 'en', [], 'CC0-1.0', [
        '1',
        '2',
        '3',
      ]),
    ])
  );

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'getTemplateTags',
  ]);
  mockBaseTemplateService.getTemplateTags.and.returnValue(
    of([{ id: 'tagId', name: 'tagName' }])
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContentGroupTemplateSelectionComponent],
      imports: [
        CoreModule,
        BrowserAnimationsModule,
        getTranslocoModule(),
        TemplateTagSelectionComponent,
        TemplateLanguageSelectionComponent,
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
          provide: BaseTemplateService,
          useValue: mockBaseTemplateService,
        },
      ],
    });
    fixture = TestBed.createComponent(ContentGroupTemplateSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
