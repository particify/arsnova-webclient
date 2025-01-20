import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { Membership } from '@app/core/models/membership';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { FormService } from '@app/core/services/util/form.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomSelectionComponent } from '@app/standalone/_dialogs/room-selection/room-selection.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { TranslocoService } from '@jsverse/transloco';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-template-button',
  imports: [CoreModule, LoadingButtonComponent],
  templateUrl: './add-template-button.component.html',
})
export class AddTemplateButtonComponent extends FormComponent {
  @Input({ required: true }) templateId!: string;
  @Input({ required: true }) templateName!: string;
  @Input() room?: Room;
  routeAfterSuccess: string[] = [];

  constructor(
    protected formService: FormService,
    private templateService: BaseTemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private membershipService: RoomMembershipService,
    private router: Router,
    private routingService: RoutingService,
    private dialogService: DialogService
  ) {
    super(formService);
  }

  useTemplate(): void {
    if (this.room) {
      this.setRoute(UserRole.EDITOR, this.room.shortId);
      this.createTemplate(this.room.id);
    } else {
      this.membershipService
        .getCurrentMemberships()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((memberships) => {
          if (memberships.length > 0) {
            this.openRoomSelectionDialog(memberships);
          } else {
            const dialogRef = this.dialogService.openRoomCreateDialog(
              this.templateName,
              undefined,
              false
            );
            dialogRef.afterClosed().subscribe((room) => {
              if (room) {
                this.setRoute(UserRole.EDITOR, room.shortId);
                this.createTemplate(room.id, false);
              }
            });
          }
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

  private setRoute(role: UserRole, shortId: string): void {
    this.routeAfterSuccess = [this.routingService.getRoleRoute(role), shortId];
  }

  private openRoomSelectionDialog(memberships: Membership[]): void {
    const dialogRef = this.dialog.open(RoomSelectionComponent, {
      width: '600px',
      data: {
        memberships: memberships,
      },
    });
    dialogRef.afterClosed().subscribe((membership?: Membership) => {
      if (membership) {
        this.setRoute(
          this.membershipService.selectPrimaryRole(membership.roles),
          membership.roomShortId
        );
        this.createTemplate(membership.roomId);
      }
    });
  }
}
