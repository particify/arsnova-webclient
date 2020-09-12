import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../../components/shared/_dialogs/yes-no-dialog/yes-no-dialog.component';
import { InfoDialogComponent } from '../../components/shared/_dialogs/info-dialog/info-dialog.component';
import { ContentEditComponent } from '../../components/shared/_dialogs/content-edit/content-edit.component';
import { ContentGroupCreationComponent } from '../../components/shared/_dialogs/content-group-creation/content-group-creation.component';
import { ClientAuthentication } from '../../models/client-authentication';
import { CreateCommentComponent } from '../../components/shared/_dialogs/create-comment/create-comment.component';
import { PresentCommentComponent } from '../../components/shared/_dialogs/present-comment/present-comment.component';
import { QrCodeComponent } from '../../components/shared/_dialogs/qr-code/qr-code.component';
// import { RemindOfTokensComponent } from '../../components/shared/_dialogs/remind-of-tokens/remind-of-tokens.component';
import { RoomCreateComponent } from '../../components/shared/_dialogs/room-create/room-create.component';
import { StatisticHelpComponent } from '../../components/shared/_dialogs/statistic-help/statistic-help.component';
// import { UserBonusTokenComponent } from '../../components/shared/_dialogs/user-bonus-token/user-bonus-token.component';
import { OverlayComponent } from '../../components/home/_dialogs/overlay/overlay.component';
import { UserActivationComponent } from '../../components/home/_dialogs/user-activation/user-activation.component';
import { Content } from '../../models/content';
import { UpdateInfoComponent } from '../../components/shared/_dialogs/update-info/update-info.component';

@Injectable()
export class DialogService {

  private size = {
    xsmall: '350px',
    small: '400px',
    medium: '600px',
    large: '80%',
    xlarge: '90%',
    max: '832px',
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
      maxWidth: this.size.max,
      width: this.size.xlarge,
      data: {
        section: section,
        body: body
      }
    });
  }

  openContentEditDialog(content: Content): MatDialogRef<ContentEditComponent> {
    return this.dialog.open(ContentEditComponent, {
      width: this.size.small,
      data: content
    });
  }

  openContentGroupCreationDialog(): MatDialogRef<ContentGroupCreationComponent> {
    return this.dialog.open(ContentGroupCreationComponent, {
      width: this.size.small
    });
  }

  // Shared dialogs

  openCreateCommentDialog(auth: ClientAuthentication, tags: string[]): MatDialogRef<CreateCommentComponent> {
    return this.dialog.open(CreateCommentComponent, {
      width: this.size.small,
      data: {
        auth: auth,
        tags: tags
      }
    });
  }

  openCommentPresentationDialog(commentBody: string): MatDialogRef<PresentCommentComponent> {
    return this.dialog.open(PresentCommentComponent, {
      position: {
        left: '10px',
        right: '10px'
      },
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      data: commentBody
    });
  }

  openQRCodeDialog(url: string): MatDialogRef<QrCodeComponent> {
    return this.dialog.open(QrCodeComponent, {
      panelClass: 'screenDialog',
      data: url
    });
  }

  /*
  openTokenReminderDialog(): MatDialogRef<RemindOfTokensComponent> {
    return this.dialog.open(RemindOfTokensComponent, {
      width: this.size.medium
    });
  }
  */

  openRoomCreateDialog(): void {
    this.dialog.open(RoomCreateComponent, {
      width: this.size.xsmall
    });
  }

  openStatisticHelpDialog(): void {
    this.dialog.open(StatisticHelpComponent, {
      width: this.size.xsmall
    });
  }

  /*
  openBonusTokenDialog(userId: string): void {
    const dialogRef = this.dialog.open(UserBonusTokenComponent, {
      width: this.size.medium,
      data: userId
    });
  }
  */

  openOverlayDialog(): MatDialogRef<OverlayComponent> {
    return this.dialog.open(OverlayComponent);
  }

  openUserActivationDialog(username: string): MatDialogRef<UserActivationComponent> {
    return this.dialog.open(UserActivationComponent, {
      width: this.size.xsmall,
      data: username
    });
  }

  openUpdateInfoDialog(afterUpdate: boolean): MatDialogRef<UpdateInfoComponent> {
    return this.dialog.open(UpdateInfoComponent, {
      width: this.size.medium,
      disableClose: !afterUpdate,
      data: afterUpdate
    });
  }
}
