import { Component, Input, OnInit } from '@angular/core';
import { Room } from '../../../../models/room';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { Router } from '@angular/router';
import { EventService } from '../../../../services/util/event.service';
import { RoomDeleted } from '../../../../models/events/room-deleted';
import { LanguageService } from '../../../../services/util/language.service';
import { DialogService } from '../../../../services/util/dialog.service';

@Component({
  selector: 'app-room-edit',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Input() editRoom: Room;
  @Input() name: string;
  @Input() description: string;

  constructor(public notificationService: NotificationService,
              public translationService: TranslateService,
              protected roomService: RoomService,
              public router: Router,
              public eventService: EventService,
              protected translateService: TranslateService,
              protected langService: LanguageService,
              private dialogService: DialogService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
  }

  openDeleteRoomDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-session', this.editRoom.name);
    dialogRef.afterClosed().subscribe(result => {
        if (result === 'delete') {
          this.deleteRoom(this.editRoom);
        }
      });
  }

  deleteRoom(room: Room): void {
    this.translationService.get('settings.deleted').subscribe(msg => {
      this.notificationService.show(room.name + msg);
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
    this.roomService.updateRoom(this.editRoom)
      .subscribe((room) => {
        this.editRoom = room;
        this.translateService.get('settings.changes-successful').subscribe(msg => {
          this.notificationService.show(msg);
        });
      });
  }
}
