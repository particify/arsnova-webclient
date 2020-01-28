import { Component, Inject, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { MatDialog } from '@angular/material';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../services/http/room.service';
import { Router } from '@angular/router';
import { EventService } from '../../../services/util/event.service';
import { RoomDeleteComponent } from '../_dialogs/room-delete/room-delete.component';
import { RoomDeleted } from '../../../models/events/room-deleted';
import { LanguageService } from '../../../services/util/language.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  editRoom: Room;

  constructor(public dialog: MatDialog,
              public notificationService: NotificationService,
              public translationService: TranslateService,
              protected roomService: RoomService,
              public router: Router,
              public eventService: EventService,
              protected translateService: TranslateService,
              protected langService: LanguageService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
    const shortId = localStorage.getItem('shortId');
    this.roomService.getRoomByShortId(shortId).subscribe(room => {
      this.editRoom = room;
    });
  }

  openDeleteRoomDialog(): void {
    const dialogRef = this.dialog.open(RoomDeleteComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.room = this.editRoom;
    dialogRef.afterClosed()
      .subscribe(result => {
        if (result === 'delete') {
          this.deleteRoom(this.editRoom);
        }
      });
  }

  deleteRoom(room: Room): void {
    this.translationService.get('room-page.deleted').subscribe(msg => {
      this.notificationService.show(room.name + msg);
    });
    this.roomService.deleteRoom(room.id).subscribe(result => {
      const event = new RoomDeleted(room.id);
      this.eventService.broadcast(event.type, event.payload);
      this.router.navigate([`/user`]);
    });
  }



}
