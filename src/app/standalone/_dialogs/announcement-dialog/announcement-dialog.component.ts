import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  DIALOG_SIZES,
  DialogService,
} from '@app/core/services/util/dialog.service';
import {
  AnnouncementFormComponent,
  EditableAnnouncement,
} from '@app/standalone/announcement-form/announcement-form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { filter, merge } from 'rxjs';

export interface AnnouncementDialogData {
  roomId: string;
  /** Edits this announcement instead of creating a new one. */
  announcement?: EditableAnnouncement;
}

/** Creates or edits an announcement, closing with the ID of the saved one. */
@Component({
  selector: 'app-announcement-dialog',
  templateUrl: './announcement-dialog.component.html',
  styleUrls: ['./announcement-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    AnnouncementFormComponent,
    LoadingButtonComponent,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    TranslocoPipe,
  ],
})
export class AnnouncementDialogComponent {
  readonly data = inject<AnnouncementDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<AnnouncementDialogComponent, string>>(MatDialogRef);
  private readonly dialogService = inject(DialogService);

  readonly form = viewChild.required(AnnouncementFormComponent);

  constructor() {
    // Opened with disableClose, so that Escape and the backdrop ask before discarding input.
    merge(
      this.dialogRef.backdropClick(),
      this.dialogRef
        .keydownEvents()
        .pipe(filter((event) => event.key === 'Escape'))
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cancel());
  }

  save() {
    this.form().save();
  }

  close(savedId?: string) {
    this.dialogRef.close(savedId);
  }

  cancel() {
    if (!this.form().hasChanges()) {
      this.close();
      return;
    }
    this.dialogService
      .openDeleteDialog(
        'announcement',
        'creator.dialog.really-discard-announcement',
        undefined,
        'creator.dialog.discard'
      )
      .afterClosed()
      .pipe(filter((discard) => !!discard))
      .subscribe(() => this.close());
  }
}

export function openAnnouncementDialog(
  dialogService: DialogService,
  data: AnnouncementDialogData
): MatDialogRef<AnnouncementDialogComponent, string> {
  return dialogService.openDialog(AnnouncementDialogComponent, {
    width: DIALOG_SIZES.medium,
    maxWidth: '90vw',
    disableClose: true,
    data,
  });
}
