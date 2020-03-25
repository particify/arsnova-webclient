import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../../components/shared/_dialogs/yes-no-dialog/yes-no-dialog.component';
import { InfoDialogComponent } from '../../components/shared/_dialogs/info-dialog/info-dialog.component';
import { CommentExportComponent } from '../../components/creator/_dialogs/comment-export/comment-export.component';
import { ContentEditComponent } from '../../components/creator/_dialogs/content-edit/content-edit.component';
import { ContentChoice } from '../../models/content-choice';
import { ContentGroupCreationComponent } from '../../components/creator/_dialogs/content-group-creation/content-group-creation.component';

@Injectable()
export class DialogService {

  private size = {
    small: '400px'
  };

  constructor(public dialog: MatDialog) {
  }

  openDeleteDialog(body: string, bodyElement?: string): MatDialogRef<YesNoDialogComponent> {
    return this.dialog.open(YesNoDialogComponent, {
      width: this.size.small,
      data: {
        section: 'dialog',
        headerLabel: 'sure',
        body: body,
        confirmLabel: 'delete',
        abortLabel: 'cancel',
        type: 'button-warn',
        bodyElement: bodyElement,
      }
    });
  }

  openInfoDialog(section: string, body: string): void {
    this.dialog.open(InfoDialogComponent, {
      'width': '80%',
      data: {
        section: section,
        body: body
      }
    });
  }

  openCommentExportDialog(): MatDialogRef<CommentExportComponent> {
    return this.dialog.open(CommentExportComponent, {
      width: this.size.small
    });
  }

  openContentEditDialog(content: ContentChoice): MatDialogRef<ContentEditComponent> {
    return this.dialog.open(ContentEditComponent, {
      width: '400px',
      data: {
        content: content
      }
    });
  }

  openContentGroupCreationDialog(): MatDialogRef<ContentGroupCreationComponent> {
    return this.dialog.open(ContentGroupCreationComponent, {
      width: '400px'
    });
  }
}
