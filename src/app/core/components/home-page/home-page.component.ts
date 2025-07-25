import { Component, Input, inject } from '@angular/core';
import { ApiConfig } from '@app/core/models/api-config';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { FlexModule } from '@angular/flex-layout';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { RoomJoinComponent } from '@app/core/components/room-join/room-join.component';
import { MatButton } from '@angular/material/button';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [
    AutofocusDirective,
    FlexModule,
    ExtensionPointComponent,
    RoomJoinComponent,
    MatButton,
    HotkeyDirective,
    MatIcon,
    TranslocoPipe,
    DisabledIfReadonlyDirective,
  ],
})
export class HomePageComponent {
  private dialogService = inject(DialogService);
  private globalStorageService = inject(GlobalStorageService);

  // Route data input below
  @Input({ required: true }) apiConfig!: ApiConfig;

  deviceType: string;

  constructor() {
    this.deviceType = this.globalStorageService.getItem(
      STORAGE_KEYS.DEVICE_TYPE
    );
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }

  getAppTitle(): string {
    return this.apiConfig.ui.registration?.service || 'ARSnova';
  }
}
