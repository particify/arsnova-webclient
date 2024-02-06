import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSelectionComponent } from './room-selection.component';
import { RoomService } from '@app/core/services/http/room.service';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockMatDialogRef } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('RoomSelectionComponent', () => {
  let component: RoomSelectionComponent;
  let fixture: ComponentFixture<RoomSelectionComponent>;

  const mockRoomService = jasmine.createSpyObj(['getRoomSummaries']);
  mockRoomService.getRoomSummaries.and.returnValue(of([]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RoomSelectionComponent, getTranslocoModule()],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        { provide: MAT_DIALOG_DATA, useValue: { memberships: [] } },
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
