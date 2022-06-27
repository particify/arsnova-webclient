import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRouteStub } from '../../../../testing/test-helpers';
import { RoomPageComponent } from './room-page.component';
import { UserRole } from '../../../models/user-roles.enum';
import { of } from 'rxjs';

describe('RoomPageComponent', () => {
  let component: RoomPageComponent;
  let fixture: ComponentFixture<RoomPageComponent>;

  const body = {
    UserCountChanged: {
      userCount: 42
    }
  };
  const message = {
    body: JSON.stringify(body)
  }

  const summaries = [
    {
      stats: {
        roomUserCount: 24
      }
    }
  ]

  let mockRoomService = jasmine.createSpyObj(['getCurrentRoomsMessageStream', 'getRoomSummaries']);
  mockRoomService.getCurrentRoomsMessageStream.and.returnValue(of(message));
  mockRoomService.getRoomSummaries.and.returnValue(of(summaries));

  const data = {
    room: {
      id: '1234'
    },
    viewRole: UserRole.CREATOR
  }

  const activatedRouteStub = new ActivatedRouteStub(null, data);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoomPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: RoomService,
          useValue: mockRoomService
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
