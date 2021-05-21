import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { UpdateAvailableEvent } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { YesNoDialogComponent } from '../../components/shared/_dialogs/yes-no-dialog/yes-no-dialog.component';
import { InfoDialogComponent } from '../../components/shared/_dialogs/info-dialog/info-dialog.component';
import { ContentGroupCreationComponent } from '../../components/creator/_dialogs/content-group-creation/content-group-creation.component';
import { ClientAuthentication } from '../../models/client-authentication';
import { CreateCommentComponent } from '../../components/shared/_dialogs/create-comment/create-comment.component';
import { PresentCommentComponent } from '../../components/shared/_dialogs/present-comment/present-comment.component';
import { QrCodeComponent } from '../../components/creator/_dialogs/qr-code/qr-code.component';
// import { RemindOfTokensComponent } from '../../components/shared/_dialogs/remind-of-tokens/remind-of-tokens.component';
import { RoomCreateComponent } from '../../components/shared/_dialogs/room-create/room-create.component';
import { StatisticHelpComponent } from '../../components/creator/_dialogs/statistic-help/statistic-help.component';
// import { UserBonusTokenComponent } from '../../components/shared/_dialogs/user-bonus-token/user-bonus-token.component';
import { OverlayComponent } from '../../components/home/_dialogs/overlay/overlay.component';
import { UserActivationComponent } from '../../components/home/_dialogs/user-activation/user-activation.component';
import { UpdateInfoComponent } from '../../components/shared/_dialogs/update-info/update-info.component';
import { UserRole } from '../../models/user-roles.enum';
import { VersionInfo } from '../../models/version-info';
import { ExportComponent, ExportOptions } from '../../components/creator/_dialogs/export/export.component';

@Injectable()
export class DialogService {

  size = {
    xsmall: '350px',
    small: '400px',
    medium: '600px',
    large: '80%',
    xlarge: '90%',
    max: '832px',
  };

  constructor(public dialog: MatDialog) {
  }

  openDialog<T>(component: ComponentType<T>, config?: MatDialogConfig): MatDialogRef<T> {
    return this.dialog.open(component, config);
  }

  openDeleteDialog(body: string, bodyElement?: string, confirmLabel?: string): MatDialogRef<YesNoDialogComponent> {
    return this.dialog.open(YesNoDialogComponent, {
      width: this.size.small,
      data: {
        section: 'dialog',
        headerLabel: 'sure',
        body: body,
        confirmLabel: confirmLabel ? confirmLabel : 'delete',
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

  openContentGroupCreationDialog(): MatDialogRef<ContentGroupCreationComponent> {
    return this.dialog.open(ContentGroupCreationComponent, {
      width: this.size.small
    });
  }

  // Shared dialogs

  openCreateCommentDialog(auth: ClientAuthentication, tags: string[], roomId: string, directSend: boolean,
                          role: UserRole): MatDialogRef<CreateCommentComponent> {
    return this.dialog.open(CreateCommentComponent, {
      width: this.size.small,
      data: {
        auth: auth,
        tags: tags,
        roomId: roomId,
        directSend: directSend,
        role: role
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

  openQRCodeDialog(shortId: string, passwordProtected: boolean, roomId: string): MatDialogRef<QrCodeComponent> {
    return this.dialog.open(QrCodeComponent, {
      panelClass: 'screenDialog',
      data: {
        shortId: shortId,
        passwordProtected: passwordProtected,
        roomId: roomId
      }
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
  openBonusTokenDialog(userId: string, roomId: string): void {
    const dialogRef = this.dialog.open(UserBonusTokenComponent, {
      width: this.size.medium,
      data: {
        userId: userId,
        roomId: roomId
      }
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

  openUpdateInfoDialog(
      afterUpdate: boolean,
      versions?: VersionInfo[],
      updateAvailable?: Observable<UpdateAvailableEvent>
  ): MatDialogRef<UpdateInfoComponent> {
    return this.dialog.open(UpdateInfoComponent, {
      width: this.size.medium,
      disableClose: !afterUpdate,
      data: {
        afterUpdate: afterUpdate,
        versions: versions,
        updateAvailable: updateAvailable
      }
    });
  }

  openExportDialog(): MatDialogRef<ExportComponent, ExportOptions> {
    return this.dialog.open(ExportComponent);
  }
}
