import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { take } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButton } from '@angular/material/button';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnnouncementComponent } from '@app/standalone/announcement/announcement.component';
import { MatDivider } from '@angular/material/divider';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnnouncementsForCurrentUserGql } from '@gql/generated/graphql';
import { AnnouncementState } from '@app/core/models/announcement-state';

@Component({
  selector: 'app-announcement-list-gql',
  templateUrl: './announcement-list-gql.component.html',
  styleUrls: ['./announcement-list-gql.component.scss'],
  imports: [
    FlexModule,
    MatDialogTitle,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatDivider,
    MatDialogContent,
    AnnouncementComponent,
    LoadingIndicatorComponent,
    MatDialogActions,
    MatButton,
    TranslocoPipe,
  ],
})
export class AnnouncementListGqlComponent implements OnInit {
  data: { state: AnnouncementState } = inject(MAT_DIALOG_DATA);
  private dialogRef =
    inject<MatDialogRef<AnnouncementListGqlComponent>>(MatDialogRef);
  private announcementsByUser = inject(AnnouncementsForCurrentUserGql);

  selectedRoomId = signal<string>('');

  private announcementsResult = toSignal(
    this.announcementsByUser.watch().valueChanges
  );

  isLoading = computed(() => this.announcementsResult()?.loading ?? true);

  announcements = computed(() => {
    const all =
      this.announcementsResult()
        ?.data?.announcementsForCurrentUser?.edges?.map((e) => e?.node)
        .filter((n) => !!n) ?? [];

    const roomId = this.selectedRoomId();

    return roomId ? all.filter((a) => a.room?.id === roomId) : all;
  });

  rooms = computed(() => {
    const all =
      this.announcementsResult()
        ?.data?.announcementsForCurrentUser?.edges?.map((e) => e?.node)
        .filter((n) => !!n) ?? [];

    return Array.from(
      all
        .reduce((map, a) => {
          const id = a.room?.id;
          if (id && !map.has(id)) {
            map.set(id, { id, name: a.room!.name });
          }
          return map;
        }, new Map<string, { id: string; name: string }>())
        .values()
    );
  });

  newReadTimestamp = new Date();

  ngOnInit(): void {
    this.data.state.new = 0;
    this.newReadTimestamp = new Date();
    this.dialogRef
      .beforeClosed()
      .pipe(take(1))
      .subscribe(() => this.close());
  }

  getLabel(createdAt: string, updatedAt?: string) {
    const readTimestamp = this.data.state.readTimestamp;
    if (!readTimestamp || new Date(readTimestamp) < new Date(createdAt)) {
      return 'new';
    } else if (updatedAt && new Date(readTimestamp) < new Date(updatedAt)) {
      return 'edited';
    }
    return;
  }

  close() {
    this.dialogRef.close(this.newReadTimestamp);
  }
}
