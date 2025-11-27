import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Room } from '@gql/generated/graphql';
import { CoreModule } from '@app/core/core.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContentGroupTemplateSelectionComponent } from '@app/standalone/content-group-template-selection/content-group-template-selection.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-room-selection',
  imports: [CoreModule],
  templateUrl: './room-selection.component.html',
})
export class RoomSelectionComponent implements OnInit, OnDestroy {
  private dialogRef =
    inject<MatDialogRef<ContentGroupTemplateSelectionComponent>>(MatDialogRef);
  private data = inject<{
    rooms: Room[];
  }>(MAT_DIALOG_DATA);

  private destroyed$ = new Subject<void>();
  isLoading = true;
  rooms: Room[] = [];

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.rooms = this.data.rooms;
  }

  selectRoom(roomId: string): void {
    const room = this.rooms.find((m) => m.id === roomId);
    this.dialogRef.close(room);
  }
}
