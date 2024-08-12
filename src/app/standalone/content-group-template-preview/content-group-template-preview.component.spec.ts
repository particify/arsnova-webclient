import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTemplatePreviewComponent } from './content-group-template-preview.component';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { of } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ApiConfig } from '@app/core/models/api-config';
import { ViolationReportService } from '@app/core/services/http/violation-report.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { DialogService } from '@app/core/services/util/dialog.service';
import { GroupType } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

class MockContentGroupService {
  getTypeIcons() {
    return new Map<GroupType, string>();
  }
}

describe('ContentGroupTemplatePreviewComponent', () => {
  let component: ContentGroupTemplatePreviewComponent;
  let fixture: ComponentFixture<ContentGroupTemplatePreviewComponent>;

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'getContentGroupTemplate',
    'getContentTemplates',
  ]);
  mockBaseTemplateService.getContentTemplates.and.returnValue(of([]));
  mockBaseTemplateService.getContentGroupTemplate.and.returnValue(
    of(new ContentGroupTemplate('name', 'description', 'en', [], 'license'))
  );

  const mockContentService = jasmine.createSpyObj(ContentService, [
    'getTypeIcons',
  ]);
  mockContentService.getTypeIcons.and.returnValue(
    of(new Map<ContentType, string>())
  );

  const mockRoomMembershipService = jasmine.createSpyObj(
    RoomMembershipService,
    ['selectPrimaryRole']
  );

  const mockRoutingService = jasmine.createSpyObj(RoutingService, [
    'getCurrentRoute',
  ]);

  const mockApiConfigService = jasmine.createSpyObj(ApiConfigService, [
    'getApiConfig$',
  ]);
  mockApiConfigService.getApiConfig$.and.returnValue(
    of(new ApiConfig([], {}, {}))
  );

  const mockViolationReportService = jasmine.createSpyObj(
    ViolationReportService,
    ['postViolationReport']
  );

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

  const mockDialogService = jasmine.createSpyObj(DialogService, [
    'openRoomCreateDialog',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ContentGroupTemplatePreviewComponent,
        getTranslocoModule(),
        RouterTestingModule,
        TemplateLicenseComponent,
        AddTemplateButtonComponent,
      ],
      providers: [
        {
          provide: BaseTemplateService,
          useValue: mockBaseTemplateService,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: RoomMembershipService,
          useValue: mockRoomMembershipService,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService,
        },
        {
          provide: ViolationReportService,
          useValue: mockViolationReportService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ContentGroupTemplatePreviewComponent);
    component = fixture.componentInstance;
    component.template = new ContentGroupTemplate(
      'name',
      'description',
      'en',
      [],
      'cc0-1.0',
      false,
      'attribution name',
      []
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
