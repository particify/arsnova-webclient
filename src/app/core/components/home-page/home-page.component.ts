import { Component, Input, inject } from '@angular/core';
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
  standalone: false,
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
