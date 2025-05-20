import { Component, Input, OnInit, inject } from '@angular/core';
import { RoomService } from '@app/core/services/http/room.service';
import { Room } from '@app/core/models/room';
import { Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Location, AsyncPipe } from '@angular/common';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { UserRole } from '@app/core/models/user-roles.enum';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';
import { AutofocusDirective } from '../../core/directives/autofocus.directive';
import { FlexModule } from '@angular/flex-layout';
import { LoadingIndicatorComponent } from '../../standalone/loading-indicator/loading-indicator.component';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { HotkeyDirective } from '../../core/directives/hotkey.directive';
import { SettingsPanelHeaderComponent } from '../../standalone/settings-panel-header/settings-panel-header.component';
import { RoomComponent } from '../settings/room/room.component';
import { CommentSettingsComponent } from '../settings/comment-settings/comment-settings.component';
import { AccessComponent } from '../settings/access/access.component';
import { AnnouncementSettingsComponent } from '../settings/announcement-settings/announcement-settings.component';
import { A11yIntroPipe } from '../../core/pipes/a11y-intro.pipe';

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
  imports: [
    AutofocusDirective,
    FlexModule,
    LoadingIndicatorComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    HotkeyDirective,
    SettingsPanelHeaderComponent,
    RoomComponent,
    CommentSettingsComponent,
    AccessComponent,
    AnnouncementSettingsComponent,
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
  ],
})
export class SettingsPageComponent implements OnInit {
  protected roomService = inject(RoomService);
  protected eventService = inject(EventService);
  protected translateService = inject(TranslocoService);
  private globalStorageService = inject(GlobalStorageService);
  private router = inject(Router);
  private location = inject(Location);
  private notificationService = inject(NotificationService);
  private formService = inject(FormService);

  // Route data input below
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) userRole!: UserRole;
  @Input() settingsName?: string;
  settings: Settings[];
  isLoading = true;
  currentRoute?: string;

  HotkeyAction = HotkeyAction;

  constructor() {
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
