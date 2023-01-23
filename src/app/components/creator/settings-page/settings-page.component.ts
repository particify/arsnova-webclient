import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Room } from '../../../models/room';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/util/event.service';
import { LanguageService } from '../../../services/util/language.service';
import { TranslateService } from '@ngx-translate/core';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../services/util/global-storage.service';
import { Location } from '@angular/common';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '../../../services/util/notification.service';
import { HotkeyAction } from '../../../directives/hotkey.directive';
import { UserRole } from '@arsnova/app/models/user-roles.enum';

export interface Settings {
  name: string;
  icon: string;
  hotkey: string;
}

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
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {
  settings: Settings[];
  room: Room;
  isLoading = true;
  currentRoute: string;
  isCreator = false;

  HotkeyAction = HotkeyAction;

  constructor(
    protected roomService: RoomService,
    protected route: ActivatedRoute,
    protected eventService: EventService,
    protected langService: LanguageService,
    protected translateService: TranslateService,
    private globalStorageService: GlobalStorageService,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngOnInit(): void {
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.settings = [
      {
        name: 'general',
        icon: 'settings',
        hotkey: '1',
      },
      {
        name: 'comments',
        icon: 'comment',
        hotkey: '2',
      },
      {
        name: 'access',
        icon: 'admin_panel_settings',
        hotkey: '3',
      },
      {
        name: 'announcements',
        icon: 'newspaper',
        hotkey: '4',
      },
    ];
    setTimeout(() => {
      this.isCreator = this.route.snapshot.data.userRole === UserRole.CREATOR;
      this.currentRoute =
        this.route.snapshot.params['settingsName'] || this.settings[0].name;
      this.route.data.subscribe((data) => {
        this.room = data.room;
        this.isLoading = false;
        setTimeout(() => {
          document.getElementById('message-button').focus();
        }, 500);
      });
    }, 0);
  }

  saveRoom(updateEvent: UpdateEvent) {
    if (!updateEvent.loadRoom) {
      this.roomService.updateRoom(updateEvent.room).subscribe((room) => {
        this.room = room;
        if (updateEvent.showSuccessInfo) {
          this.translateService
            .get('settings.changes-successful')
            .subscribe((msg) => {
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              );
            });
        }
      });
    } else {
      this.roomService.getRoom(this.room.id).subscribe((room) => {
        this.room = room;
      });
    }
  }

  updateUrl(settingsName: string) {
    this.currentRoute = settingsName;
    const urlTree = this.router.createUrlTree([
      'edit',
      this.room.shortId,
      'settings',
      this.currentRoute,
    ]);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }
}
