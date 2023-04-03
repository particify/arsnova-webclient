import { AfterContentInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class HomePageComponent implements AfterContentInit {
  deviceType: string;
  appTitle: string;

  constructor(
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService,
    private route: ActivatedRoute
  ) {
    this.deviceType = this.globalStorageService.getItem(
      STORAGE_KEYS.DEVICE_TYPE
    );
  }

  ngAfterContentInit(): void {
    if (this.deviceType === 'desktop') {
      document.getElementById('room-id-input').focus();
    } else {
      document.getElementById('welcome-message').focus();
    }
    this.appTitle =
      this.route.snapshot.data.apiConfig.ui.registration?.service || 'ARSnova';
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }
}
