import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Room } from '@app/core/models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { RoomService } from '@app/core/services/http/room.service';
import { Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { RoomDeleted } from '@app/core/models/events/room-deleted';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  FormattingService,
  MarkdownFeatureset,
} from '@app/core/services/http/formatting.service';
import { UpdateEvent } from '@app/creator/settings-page/settings-page.component';
import { HintType } from '@app/core/models/hint-type.enum';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { take } from 'rxjs';

@Component({
  selector: 'app-room-edit',
  templateUrl: './room.component.html',
  standalone: false,
})
export class RoomComponent extends FormComponent implements OnInit {
  @Output() saveEvent: EventEmitter<UpdateEvent> =
    new EventEmitter<UpdateEvent>();

  @Input({ required: true }) editRoom!: Room;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) description!: string;
  @Input() isCreator = false;
  markdownFeatureset = MarkdownFeatureset.EXTENDED;
  renderPreview = false;
  textContainsImage = false;
  HintType = HintType;
  focusModeEnabled = false;

  constructor(
    public notificationService: NotificationService,
    public translationService: TranslocoService,
    protected roomService: RoomService,
    public router: Router,
    public eventService: EventService,
    protected translateService: TranslocoService,
    private dialogService: DialogService,
    private formattingService: FormattingService,
    private focusModeService: FocusModeService,
    protected formService: FormService
  ) {
    super(formService);
  }
  ngOnInit(): void {
    this.focusModeEnabled = this.editRoom.focusModeEnabled;
  }

  deleteRoom(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room',
      'dialog.really-delete-room',
      this.editRoom.name,
      undefined,
      () => this.roomService.deleteRoom(this.editRoom.id)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.translationService
          .selectTranslate('creator.settings.deleted')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              this.editRoom.name + msg,
              AdvancedSnackBarTypes.WARNING
            );
          });
        const event = new RoomDeleted(this.editRoom.id);
        this.eventService.broadcast(event.type, event.payload);
        this.router.navigateByUrl('user');
      }
    });
  }

  saveChanges() {
    this.editRoom.name = this.name;
    this.editRoom.description = this.description;
    this.saveEvent.emit(new UpdateEvent(this.editRoom, true));
  }

  descriptionTabChanged($event: MatTabChangeEvent) {
    this.renderPreview = $event.index === 1;
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }

  toggleFocusMode(focusModeEnabled: boolean) {
    const changes: { focusModeEnabled: boolean } = {
      focusModeEnabled: focusModeEnabled,
    };
    this.roomService.patchRoom(this.editRoom.id, changes).subscribe((room) => {
      this.editRoom.focusModeEnabled = room.focusModeEnabled;
      if (focusModeEnabled) {
        this.focusModeService.updateOverviewState(this.editRoom);
      }
    });
  }
}
