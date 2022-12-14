import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Room } from '../../../../models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { Router } from '@angular/router';
import { EventService } from '../../../../services/util/event.service';
import { RoomDeleted } from '../../../../models/events/room-deleted';
import { LanguageService } from '../../../../services/util/language.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import {
  FormattingService,
  MarkdownFeatureset,
} from '../../../../services/http/formatting.service';
import { UpdateEvent } from '../settings.component';
import { HINT_TYPES } from '../../../shared/hint/hint.component';

@Component({
  selector: 'app-room-edit',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent {
  @Output() saveEvent: EventEmitter<UpdateEvent> =
    new EventEmitter<UpdateEvent>();

  @Input() editRoom: Room;
  @Input() name: string;
  @Input() description: string;
  markdownFeatureset = MarkdownFeatureset.EXTENDED;
  renderPreview = false;
  textContainsImage = false;
  warningType = HINT_TYPES.WARNING;

  constructor(
    public notificationService: NotificationService,
    public translationService: TranslateService,
    protected roomService: RoomService,
    public router: Router,
    public eventService: EventService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService,
    private formattingService: FormattingService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  openDeleteRoomDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room',
      'really-delete-room',
      this.editRoom.name
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRoom(this.editRoom);
      }
    });
  }

  deleteRoom(room: Room): void {
    this.roomService.deleteRoom(room.id).subscribe(() => {
      this.translationService.get('settings.deleted').subscribe((msg) => {
        this.notificationService.showAdvanced(
          room.name + msg,
          AdvancedSnackBarTypes.WARNING
        );
      });
      const event = new RoomDeleted(room.id);
      this.eventService.broadcast(event.type, event.payload);
      this.router.navigateByUrl('user');
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
}
