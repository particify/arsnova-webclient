import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTemplateButtonComponent } from './add-template-button.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { RoutingService } from '@app/core/services/util/routing.service';

describe('AddTemplateButtonComponent', () => {
  let component: AddTemplateButtonComponent;
  let fixture: ComponentFixture<AddTemplateButtonComponent>;

  const mockRoomMembershipService = jasmine.createSpyObj(['selectPrimaryRole']);

  const mockBaseTemplateService = jasmine.createSpyObj(BaseTemplateService, [
    'createCopyFromContentGroupTemplate',
  ]);

  const mockRoutingService = jasmine.createSpyObj(RoutingService, [
    'getRoleRoute',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddTemplateButtonComponent,
        getTranslocoModule(),
        RouterTestingModule,
      ],
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
    });
    fixture = TestBed.createComponent(AddTemplateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
