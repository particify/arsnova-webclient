import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { Membership } from '@app/core/models/membership';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { FormService } from '@app/core/services/util/form.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomSelectionComponent } from '@app/standalone/_dialogs/room-selection/room-selection.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { TranslocoService } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-template-button',
  standalone: true,
  imports: [CoreModule, LoadingButtonComponent],
  templateUrl: './add-template-button.component.html',
})
export class AddTemplateButtonComponent extends FormComponent {
  @Input() templateId: string;
  @Input() roomId?: string;
  @Output() templateAddedToRoom = new EventEmitter<string>();

  constructor(
    protected formService: FormService,
    private templateService: BaseTemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private membershipService: RoomMembershipService,
    private router: Router,
    private routingService: RoutingService
  ) {
    super(formService);
  }

  use(membership?: Membership) {
    const roomId = this.roomId || membership?.roomId;
    if (roomId) {
      this.disableForm();
      this.templateService
        .createCopyFromContentGroupTemplate(this.templateId, roomId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            const msg = this.translateService.translate(
              'templates.template-added'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.enableForm();
            this.templateAddedToRoom.emit(roomId);
            if (membership) {
              const role = this.membershipService.selectPrimaryRole(
                membership.roles
              );
              this.router.navigate([
                this.routingService.getRoleRoute(role),
                membership.roomShortId,
              ]);
            }
          },
          error: () => {
            this.enableForm();
          },
        });
    } else {
      const dialogRef = this.dialog.open(RoomSelectionComponent, {
        width: '600px',
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.use(result);
        }
      });
    }
  }
}
