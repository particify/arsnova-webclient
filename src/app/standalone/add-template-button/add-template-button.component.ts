import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoomSelectionComponent } from '@app/standalone/_dialogs/room-selection/room-selection.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  CreateQuestionnaireFromTemplateGql,
  QuestionnairesByRoomIdDocument,
  Room,
  RoomMembershipsGql,
  RoomRole,
} from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { filter, map, takeUntil } from 'rxjs';

interface TargetRoom {
  id: string;
  shortId: string;
}

@Component({
  selector: 'app-add-template-button',
  imports: [CoreModule, LoadingButtonComponent],
  templateUrl: './add-template-button.component.html',
})
export class AddTemplateButtonComponent extends FormComponent {
  private createQuestionnaireFromTemplate = inject(
    CreateQuestionnaireFromTemplateGql
  );
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private roomMembershipsGql = inject(RoomMembershipsGql);

  readonly templateId = input.required<string>();
  readonly templateName = input.required<string>();
  readonly roomId = input<string>();
  readonly shortId = input<string>();

  useTemplate(): void {
    const roomId = this.roomId();
    const shortId = this.shortId();
    if (roomId && shortId) {
      this.createQuestionnaire({ id: roomId, shortId });
    } else {
      this.disableForm();
      this.roomMembershipsGql
        .fetch({
          variables: { query: { anyRole: [RoomRole.Owner] } },
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
                this.templateName(),
                undefined,
                false
              );
              dialogRef.afterClosed().subscribe((room?: TargetRoom) => {
                if (room) {
                  this.createQuestionnaire(room, false);
                }
              });
            }
          },
        });
    }
  }

  private createQuestionnaire(room: TargetRoom, showNotification = true): void {
    this.disableForm();
    this.createQuestionnaireFromTemplate
      .mutate({
        variables: {
          input: { roomId: room.id, templateId: this.templateId() },
        },
        refetchQueries: [QuestionnairesByRoomIdDocument],
      })
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
          this.router.navigate(['edit', room.shortId]);
        },
        error: () => {
          this.enableForm();
        },
      });
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
        this.createQuestionnaire(room);
      }
    });
  }
}
