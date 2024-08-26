import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { VersionReadyEvent } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
import { ContentGroupCreationComponent } from '@app/creator/_dialogs/content-group-creation/content-group-creation.component';
import { RoomCreateComponent } from '@app/core/components/_dialogs/room-create/room-create.component';
import { UserActivationComponent } from '@app/core/components//_dialogs/user-activation/user-activation.component';
import { UpdateInfoComponent } from '@app/core/components/update-info/update-info.component';
import { VersionInfo } from '@app/core/models/version-info';
import {
  ExportComponent,
  ExportOptions,
} from '@app/creator/content-group/_dialogs/export/export.component';
import { EventCategory, TrackingService } from './tracking.service';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { PublishContentGroupDialogComponent } from '@app/presentation/_dialogs/publish-content-group-dialog/publish-content-group-dialog.component';

export const DIALOG_SIZES: Readonly<Record<string, string>> = {
  xsmall: '350px',
  small: '400px',
  medium: '600px',
  large: '80%',
  xlarge: '90%',
  max: '832px',
};

@Injectable()
export class DialogService {
  constructor(
    public dialog: MatDialog,
    private trackingService: TrackingService
  ) {
    // FIXME: This condition is currently necessary because there are multiple
    // dialog service instances - one per lazy loaded module. It is a workaround
    // until we have a way to only create a single instance and might break if
    // subscriptions to the afterOpened event are added in other places.
    if (!this.dialog.afterOpened.observed) {
      this.dialog.afterOpened.subscribe((dialogRef) =>
        this.trackingService.addEvent(
          EventCategory.UI_DIALOG,
          'Dialog opened',
          dialogRef.componentInstance.dialogId
        )
      );
    }
  }

  openDialog<T>(
    component: ComponentType<T>,
    config?: MatDialogConfig
  ): MatDialogRef<T> {
    const ref = this.dialog.open(component, config);
    ref
      .afterClosed()
      .subscribe((result) =>
        this.trackingService.addEvent(
          EventCategory.UI_DIALOG,
          this.isCancelAction(result) ? 'Dialog cancelled' : 'Dialog confirmed',
          (ref.componentInstance as any).dialogId
        )
      );
    return ref;
  }

  openDeleteDialog(
    dialogIdSuffix: string,
    body: string,
    bodyElement?: string,
    confirmLabel?: string,
    confirmAction?: () => Observable<object | void>
  ): MatDialogRef<BaseDialogComponent> {
    return this.openDialog(BaseDialogComponent, {
      width: DIALOG_SIZES.small,
      data: {
        dialogId: 'delete-' + dialogIdSuffix,
        body: body,
        headerLabel: 'dialog.sure',
        confirmLabel: confirmLabel ? confirmLabel : 'dialog.delete',
        abortLabel: 'dialog.cancel',
        type: 'button-warn',
        bodyElement: bodyElement,
        confirmAction: confirmAction,
      },
    });
  }

  openContentGroupCreationDialog(
    roomId?: string,
    type?: GroupType
  ): MatDialogRef<ContentGroupCreationComponent> {
    return this.openDialog(ContentGroupCreationComponent, {
      width: DIALOG_SIZES.medium,
      maxWidth: '90vw',
      data: {
        roomId: roomId,
        type: type,
      },
    });
  }

  // Shared dialogs

  openRoomCreateDialog(
    prefilledName?: string,
    roomId?: string,
    navigateAfterCreation = true
  ): MatDialogRef<RoomCreateComponent> {
    return this.openDialog(RoomCreateComponent, {
      width: DIALOG_SIZES.xsmall,
      data: {
        prefilledName: prefilledName,
        roomId: roomId,
        navigateAfterCreation: navigateAfterCreation,
      },
    });
  }

  openUserActivationDialog(
    username: string
  ): MatDialogRef<UserActivationComponent> {
    return this.openDialog(UserActivationComponent, {
      width: DIALOG_SIZES.xsmall,
      data: username,
    });
  }

  openUpdateInfoDialog(
    afterUpdate: boolean,
    versions?: VersionInfo[],
    updateAvailable?: Observable<VersionReadyEvent>
  ): MatDialogRef<UpdateInfoComponent> {
    return this.openDialog(UpdateInfoComponent, {
      width: DIALOG_SIZES.medium,
      disableClose: !afterUpdate,
      data: {
        afterUpdate: afterUpdate,
        versions: versions,
        updateAvailable: updateAvailable,
      },
    });
  }

  openExportDialog(): MatDialogRef<ExportComponent, ExportOptions> {
    return this.openDialog(ExportComponent);
  }

  openPublishGroupDialog(
    contentGroup: ContentGroup
  ): MatDialogRef<PublishContentGroupDialogComponent> {
    return this.openDialog(PublishContentGroupDialogComponent, {
      width: DIALOG_SIZES.small,
      data: {
        contentGroup: contentGroup,
      },
    });
  }

  private isCancelAction(action?: string) {
    return !action;
  }
}
