import { AfterContentInit, Component } from '@angular/core';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements AfterContentInit {

  deviceType: string;

  constructor(
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService
  ) {
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
  }

  ngAfterContentInit(): void {
    if (this.deviceType === 'desktop') {
      document.getElementById('room-id-input').focus();
    } else {
      document.getElementById('welcome-message').focus();
    }
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }
}
