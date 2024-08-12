import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentGroupsComponent } from './content-groups.component';
import { Router } from '@angular/router';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { NotificationService } from '@app/core/services/util/notification.service';

class MockContentGroupService {
  patchContentGroup() {}

  getTypeIcons() {
    return new Map<GroupType, string>();
  }
}

describe('ContentGroupsComponent', () => {
  let component: ContentGroupsComponent;
  let fixture: ComponentFixture<ContentGroupsComponent>;

  const mockRoutingService = jasmine.createSpyObj('RoutingService', [
    'getRoleRoute',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContentGroupsComponent, getTranslocoModule()],
      providers: [
        ContentPublishService,
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentGroupsComponent);
    component = fixture.componentInstance;
    component.contentGroup = new ContentGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
