import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Room } from '@app/core/models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '@app/core/services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { RoomDeleted } from '@app/core/models/events/room-deleted';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  FormattingService,
  MarkdownFeatureset,
} from '@app/core/services/http/formatting.service';
import { UpdateEvent } from '@app/creator/settings-page/settings-page.component';
import { UserRole } from '@app/core/models/user-roles.enum';
import { HintType } from '@app/core/models/hint-type.enum';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-room-edit',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent extends FormComponent implements OnInit {
  @Output() saveEvent: EventEmitter<UpdateEvent> =
    new EventEmitter<UpdateEvent>();

  @Input() editRoom: Room;
  @Input() name: string;
  @Input() description: string;
  markdownFeatureset = MarkdownFeatureset.EXTENDED;
  renderPreview = false;
  textContainsImage = false;
  HintType = HintType;
  isCreator = false;
  focusModeEnabled = false;

  constructor(
    public notificationService: NotificationService,
    public translationService: TranslateService,
    protected roomService: RoomService,
    public router: Router,
    public eventService: EventService,
    protected translateService: TranslateService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private formattingService: FormattingService,
    private focusModeService: FocusModeService,
    protected formService: FormService
  ) {
    super(formService);
  }
  ngOnInit(): void {
    this.isCreator = this.route.snapshot.data.userRole === UserRole.OWNER;
    this.focusModeEnabled = this.editRoom.focusModeEnabled;
  }

  deleteRoom(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room',
      'really-delete-room',
      this.editRoom.name,
      undefined,
      () => this.roomService.deleteRoom(this.editRoom.id)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.translationService.get('settings.deleted').subscribe((msg) => {
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

  descriptionTabChanged($event) {
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
