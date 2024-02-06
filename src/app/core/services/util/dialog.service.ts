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
      width: this.size.small,
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
    roomId?: string
  ): MatDialogRef<ContentGroupCreationComponent> {
    return this.openDialog(ContentGroupCreationComponent, {
      width: this.size.small,
      data: {
        roomId: roomId,
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
      width: this.size.xsmall,
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
      width: this.size.xsmall,
      data: username,
    });
  }

  openUpdateInfoDialog(
    afterUpdate: boolean,
    versions?: VersionInfo[],
    updateAvailable?: Observable<VersionReadyEvent>
  ): MatDialogRef<UpdateInfoComponent> {
    return this.openDialog(UpdateInfoComponent, {
      width: this.size.medium,
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
    groupName: string,
    confirmAction: () => Observable<object>
  ): MatDialogRef<BaseDialogComponent> {
    return this.openDialog(BaseDialogComponent, {
      width: this.size.small,
      data: {
        dialogId: 'publish-content-group',
        headerLabel: 'creator.dialog.publish-group',
        body: 'creator.dialog.want-publish-group',
        confirmLabel: 'creator.dialog.publish',
        abortLabel: 'dialog.cancel',
        type: 'button-primary',
        bodyElement: groupName,
        confirmAction: confirmAction,
      },
    });
  }

  private isCancelAction(action?: string) {
    return !action;
  }
}
