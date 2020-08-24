import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Room } from '../../../../models/room';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { Router } from '@angular/router';
import { EventService } from '../../../../services/util/event.service';
import { RoomDeleted } from '../../../../models/events/room-deleted';
import { LanguageService } from '../../../../services/util/language.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';

@Component({
  selector: 'app-room-edit',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Output() saveEvent: EventEmitter<Room> = new EventEmitter<Room>();

  @Input() editRoom: Room;
  @Input() name: string;
  @Input() description: string;

  constructor(
    public notificationService: NotificationService,
    public translationService: TranslateService,
    protected roomService: RoomService,
    public router: Router,
    public eventService: EventService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  openDeleteRoomDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-room', this.editRoom.name);
    dialogRef.afterClosed().subscribe(result => {
        if (result === 'delete') {
          this.deleteRoom(this.editRoom);
        }
      });
  }

  deleteRoom(room: Room): void {
    this.translationService.get('settings.deleted').subscribe(msg => {
      this.notificationService.showAdvanced(room.name + msg, AdvancedSnackBarTypes.WARNING);
    });
    this.roomService.deleteRoom(room.id).subscribe(result => {
      const event = new RoomDeleted(room.id);
      this.eventService.broadcast(event.type, event.payload);
      this.router.navigate([`/user`]);
    });
  }

  saveChanges() {
    this.editRoom.name = this.name;
    this.editRoom.description = this.description;
    this.saveEvent.emit(this.editRoom);
  }
}
