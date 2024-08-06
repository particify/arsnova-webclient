import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomOverviewHeaderComponent } from './room-overview-header.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService } from '@testing/test-helpers';
import { NotificationService } from '@app/core/services/util/notification.service';

describe('RoomOverviewHeaderComponent', () => {
  let component: RoomOverviewHeaderComponent;
  let fixture: ComponentFixture<RoomOverviewHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomOverviewHeaderComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomOverviewHeaderComponent);
    component = fixture.componentInstance;
    component.name = 'THis is a room name';
    component.roomJoinUrl = 'https://awesome-room-join-url.de';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
