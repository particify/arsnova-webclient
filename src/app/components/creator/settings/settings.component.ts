import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/util/event.service';
import { MatDialog } from '@angular/material/dialog';
import { Room } from '../../../models/room';
import { Settings } from '../settings-page/settings-page.component';
import { Location } from '@angular/common';

export class UpdateEvent {
  room: Room;
  showSuccessInfo: boolean;
  loadRoom = false;

  constructor(room: Room, showSuccessInfo: boolean, loadRoom?: boolean) {
    this.room = room;
    this.showSuccessInfo = showSuccessInfo;
    this.loadRoom = loadRoom;
  }
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() updateEvent: EventEmitter<Room> = new EventEmitter<Room>();

  @Input() settings: Settings;
  @Input() room: Room;

  expanded = false;
  contentExpanded = false;

  constructor(public dialog: MatDialog,
              public notificationService: NotificationService,
              protected roomService: RoomService,
              public router: Router,
              public eventService: EventService,
              protected translateService: TranslateService,
              private location: Location,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const settingsRoute = params['settingsName'];
      if (this.settings.componentName === settingsRoute || !settingsRoute && this.settings.componentName === 'general') {
        this.expanded = true;
        this.contentExpanded = true;
      }
    });
    this.eventService.on<any>('SettingsExpanded').subscribe(event => {
      if (this.expanded && event !== this.settings.componentName) {
        this.expanded = false;
        this.collapse();
      }
    });
  }

  expandSettings() {
    this.expanded = !this.expanded;
    if (!this.contentExpanded) {
      this.expand();
    } else {
      this.collapse();
    }
    setTimeout(() => {
      document.getElementById((this.settings.componentName + '-settings')).focus();
    }, 100);
  }

  updateURL() {
    const urlTree = this.router.createUrlTree(['creator/room', this.room.shortId, 'settings', this.settings.componentName]);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  expand() {
    this.contentExpanded = true;
    this.eventService.broadcast('SettingsExpanded', this.settings.componentName);
    this.updateURL();
  }

  collapse() {
    setTimeout(() => {
      this.contentExpanded = false;
    }, 400)
  }

  saveRoom(updateEvent: UpdateEvent) {
    if (!updateEvent.loadRoom) {
      this.roomService.updateRoom(updateEvent.room)
        .subscribe((room) => {
          this.updateEvent.emit(room);
          if (updateEvent.showSuccessInfo) {
            this.translateService.get('settings.changes-successful').subscribe(msg => {
              this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
            });
          }
        });
    } else {
     this.roomService.getRoom(this.room.id).subscribe(room => {
       this.updateEvent.emit(room);
     });
    }
  }
}
