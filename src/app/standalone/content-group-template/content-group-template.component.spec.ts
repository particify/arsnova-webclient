import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTemplateComponent } from './content-group-template.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';

describe('ContentGroupTemplateComponent', () => {
  let component: ContentGroupTemplateComponent;
  let fixture: ComponentFixture<ContentGroupTemplateComponent>;

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'createCopyFromContentGroupTemplate',
  ]);

  const mockRoomMembershipService = jasmine.createSpyObj(['selectPrimaryRole']);

  const mockRoutingService = jasmine.createSpyObj(RoutingService, [
    'getRoleRoute',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContentGroupTemplateComponent, getTranslocoModule()],
      providers: [
        {
          provide: RoomMembershipService,
          useValue: mockRoomMembershipService,
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
          provide: RoutingService,
          useValue: mockRoutingService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ContentGroupTemplateComponent);
    component = fixture.componentInstance;
    component.template = new ContentGroupTemplate(
      'Template name',
      'Template description',
      'en',
      [{ id: 'id', name: 'Test tag', verified: true }],
      'CC0-1.0',
      false,
      'attribution name',
      ['template1', 'template2', 'template3']
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
