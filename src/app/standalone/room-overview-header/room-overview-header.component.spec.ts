import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomOverviewHeaderComponent } from './room-overview-header.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  ActivatedRouteStub,
  MockNotificationService,
} from '@testing/test-helpers';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { NotificationService } from '@app/core/services/util/notification.service';

describe('RoomOverviewHeaderComponent', () => {
  let component: RoomOverviewHeaderComponent;
  let fixture: ComponentFixture<RoomOverviewHeaderComponent>;

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    apiConfig: {
      ui: {
        links: {
          join: {
            url: 'https://partici.fi/',
          },
        },
      },
    },
  };

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const mockRoutingService = jasmine.createSpyObj('RoutingService', [
    'getRoomJoinUrl',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomOverviewHeaderComponent, getTranslocoModule()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomOverviewHeaderComponent);
    component = fixture.componentInstance;
    component.name = 'THis is a room name';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
