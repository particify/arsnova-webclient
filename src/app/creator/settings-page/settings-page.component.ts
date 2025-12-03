import { Component, OnInit, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Location, AsyncPipe } from '@angular/common';
import {
  HotkeyAction,
  HotkeyDirective,
} from '@app/core/directives/hotkey.directive';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { FlexModule } from '@angular/flex-layout';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { SettingsPanelHeaderComponent } from '@app/standalone/settings-panel-header/settings-panel-header.component';
import { RoomComponent } from '@app/creator/settings/room/room.component';
import { CommentSettingsComponent } from '@app/creator/settings/comment-settings/comment-settings.component';
import { AccessComponent } from '@app/creator/settings/access/access.component';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { AnnouncementSettingsComponent } from '@app/creator/settings/announcement-settings/announcement-settings.component';

export interface Settings {
  name: string;
  icon: string;
  hotkey: string;
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
  private readonly translateService = inject(TranslocoService);
  private readonly globalStorageService = inject(GlobalStorageService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Route data input below
  roomId = input.required<string>();
  userRole = input.required<UserRole>();
  settingsName = input<string>();
  shortId = input.required<string>();
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
    this.currentRoute = this.settingsName() || this.settings[0].name;
  }

  updateUrl(settingsName: string) {
    this.currentRoute = settingsName;
    const urlTree = this.router.createUrlTree([
      'edit',
      this.shortId(),
      'settings',
      this.currentRoute,
    ]);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  isOwner(): boolean {
    return this.userRole() === UserRole.OWNER;
  }
}
