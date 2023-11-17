import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSelectionComponent } from './room-selection.component';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MockMatDialogRef } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('RoomSelectionComponent', () => {
  let component: RoomSelectionComponent;
  let fixture: ComponentFixture<RoomSelectionComponent>;

  const mockRoomService = jasmine.createSpyObj(['getRoomSummaries']);

  const mockRoomMembershipService = jasmine.createSpyObj(
    RoomMembershipService,
    ['getCurrentMemberships']
  );
  mockRoomMembershipService.getCurrentMemberships.and.returnValue(of([]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RoomSelectionComponent, getTranslocoModule()],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: RoomMembershipService,
          useValue: mockRoomMembershipService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
      ],
    });
    fixture = TestBed.createComponent(RoomSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
