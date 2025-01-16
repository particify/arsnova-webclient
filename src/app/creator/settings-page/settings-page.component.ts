import { Component, Input, OnInit } from '@angular/core';
import { RoomService } from '@app/core/services/http/room.service';
import { Room } from '@app/core/models/room';
import { Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoService } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Location } from '@angular/common';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { UserRole } from '@app/core/models/user-roles.enum';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';

export interface Settings {
  name: string;
  icon: string;
  hotkey: string;
}

export class UpdateEvent {
  room?: Room;
  showSuccessInfo: boolean;
  loadRoom: boolean;

  constructor(room: Room | null, showSuccessInfo: boolean, loadRoom = false) {
    if (room) {
      this.room = room;
    }
    this.showSuccessInfo = showSuccessInfo;
    this.loadRoom = loadRoom;
  }
}

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  standalone: false,
})
export class SettingsPageComponent implements OnInit {
  // Route data input below
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) userRole!: UserRole;
  @Input() settingsName?: string;
  settings: Settings[];
  isLoading = true;
  currentRoute?: string;

  HotkeyAction = HotkeyAction;

  constructor(
    protected roomService: RoomService,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    private globalStorageService: GlobalStorageService,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService,
    private formService: FormService
  ) {
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
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.currentRoute = this.settingsName || this.settings[0].name;
  }

  saveRoom(updateEvent: UpdateEvent) {
    if (!updateEvent.loadRoom && updateEvent.room) {
      this.formService.disableForm();
      this.roomService.updateRoom(updateEvent.room).subscribe(
        (room) => {
          this.room = room;
          if (updateEvent.showSuccessInfo) {
            this.translateService
              .selectTranslate('creator.settings.changes-successful')
              .pipe(take(1))
              .subscribe((msg) => {
                this.notificationService.showAdvanced(
                  msg,
                  AdvancedSnackBarTypes.SUCCESS
                );
              });
          }
          this.formService.enableForm();
        },
        () => {
          this.formService.enableForm();
        }
      );
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

  isOwner(): boolean {
    return this.userRole === UserRole.OWNER;
  }
}
