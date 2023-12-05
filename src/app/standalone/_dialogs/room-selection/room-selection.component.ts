import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { RoomSummary } from '@app/core/models/room-summary';
import { CoreModule } from '@app/core/core.module';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentGroupTemplateSelectionComponent } from '@app/standalone/content-group-template-selection/content-group-template-selection.component';
import { Subject, takeUntil } from 'rxjs';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { Membership } from '@app/core/models/membership';

@Component({
  selector: 'app-room-selection',
  standalone: true,
  imports: [CoreModule, LoadingIndicatorComponent],
  templateUrl: './room-selection.component.html',
})
export class RoomSelectionComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  isLoading = true;
  rooms: RoomSummary[] = [];
  memberships: Membership[] = [];

  constructor(
    private roomService: RoomService,
    private membershipService: RoomMembershipService,
    private dialogRef: MatDialogRef<ContentGroupTemplateSelectionComponent>
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.membershipService
      .getCurrentMemberships()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((m) => {
        this.memberships = m.filter((m) => m.roles.includes(UserRole.OWNER));
        this.memberships = this.memberships.sort(
          (a, b) =>
            new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        );
        this.roomService
          .getRoomSummaries(this.memberships.map((m) => m.roomId))
          .pipe(takeUntil(this.destroyed$))
          .subscribe((rooms) => {
            this.rooms = rooms;
            this.isLoading = false;
          });
      });
  }

  selectRoom(roomId: string): void {
    const membership = this.memberships.find((m) => m.roomId === roomId);
    this.dialogRef.close(membership);
  }
}
