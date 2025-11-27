import { Component, Input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoomSelectionComponent } from '@app/standalone/_dialogs/room-selection/room-selection.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { Room, RoomMembershipsGql, RoomRole } from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { filter, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-template-button',
  imports: [CoreModule, LoadingButtonComponent],
  templateUrl: './add-template-button.component.html',
})
export class AddTemplateButtonComponent extends FormComponent {
  private templateService = inject(BaseTemplateService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private roomMembershipsGql = inject(RoomMembershipsGql);

  @Input({ required: true }) templateId!: string;
  @Input({ required: true }) templateName!: string;
  @Input() room?: Room;
  routeAfterSuccess: string[] = [];

  useTemplate(): void {
    if (this.room) {
      this.setRoute(this.room.shortId);
      this.createTemplate(this.room.id);
    } else {
      this.disableForm();
      this.roomMembershipsGql
        .fetch({
          variables: { query: { role: RoomRole.Owner } },
          fetchPolicy: 'no-cache',
        })
        .pipe(
          filter((r) => !!r.data?.roomMemberships?.edges),
          map(
            (r) =>
              r.data?.roomMemberships?.edges
                ?.map((e) => e?.node.room)
                .filter((r) => !!r) ?? []
          )
        )
        .subscribe({
          complete: () => this.enableForm(),
          next: (r) => {
            if (r.length > 0) {
              this.openRoomSelectionDialog(r);
            } else {
              const dialogRef = this.dialogService.openRoomCreateDialog(
                this.templateName,
                undefined,
                false
              );
              dialogRef.afterClosed().subscribe((room) => {
                if (room) {
                  this.setRoute(room.shortId);
                  this.createTemplate(room.id, false);
                }
              });
            }
          },
        });
    }
  }

  private createTemplate(roomId: string, showNotification = true): void {
    this.disableForm();
    this.templateService
      .createCopyFromContentGroupTemplate(this.templateId, roomId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          if (showNotification) {
            const msg = this.translateService.translate(
              'templates.template-added'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
          this.enableForm();
          if (this.routeAfterSuccess) {
            this.router.navigate(this.routeAfterSuccess);
          }
        },
        error: () => {
          this.enableForm();
        },
      });
  }

  private setRoute(shortId: string): void {
    this.routeAfterSuccess = ['edit', shortId];
  }

  private openRoomSelectionDialog(rooms: Room[]): void {
    const dialogRef = this.dialog.open(RoomSelectionComponent, {
      width: '600px',
      data: {
        rooms: rooms,
      },
    });
    dialogRef.afterClosed().subscribe((room?: Room) => {
      if (room) {
        this.setRoute(room.shortId);
        this.createTemplate(room.id);
      }
    });
  }
}
