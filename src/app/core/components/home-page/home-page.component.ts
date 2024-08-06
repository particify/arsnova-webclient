import { Component, Input } from '@angular/core';
import { ApiConfig } from '@app/core/models/api-config';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  // Route data input below
  @Input({ required: true })
  set apiConfig(config: ApiConfig) {
    this.appTitle = config.ui.registration?.service || 'ARSnova';
  }
  deviceType: string;

  appTitle!: string;

  constructor(
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService
  ) {
    this.deviceType = this.globalStorageService.getItem(
      STORAGE_KEYS.DEVICE_TYPE
    );
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }
}
