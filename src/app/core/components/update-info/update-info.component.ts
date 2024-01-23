import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VersionReadyEvent } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { VersionInfo } from '@app/core/models/version-info';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';

interface DialogData {
  afterUpdate: boolean;
  latestVersion?: VersionInfo;
  versions?: VersionInfo[];
  updateAvailable?: Observable<VersionReadyEvent>;
}

@Component({
  selector: 'app-update-info',
  templateUrl: './update-info.component.html',
  styleUrls: ['./update-info.component.scss'],
})
export class UpdateInfoComponent implements OnInit {
  readonly dialogId = 'update-info';

  isLoading = true;
  changes: string[] = [];
  newsUrl?: string;
  afterUpdate = false;
  versions: VersionInfo[];
  updateReady = false;
  inputFocus = false;

  constructor(
    public dialogRef: MatDialogRef<UpdateInfoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private apiConfigService: ApiConfigService,
    private globalStorageService: GlobalStorageService
  ) {
    this.afterUpdate = data.afterUpdate;
    this.versions = data.versions ?? [];
  }

  ngOnInit(): void {
    const lang = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    this.changes = this.versions
      .filter((v) => v.changes?.[lang]?.length > 0)
      .reduce(
        (acc, cur) => (cur.id > acc.id ? cur : acc),
        this.versions[0]
      )?.changes[lang];
    if (this.data.updateAvailable) {
      this.data.updateAvailable.subscribe(() => (this.updateReady = true));
    } else {
      this.updateReady = true;
    }
    this.apiConfigService.getApiConfig$().subscribe((config) => {
      this.newsUrl = config.ui.links?.news?.url;
      this.isLoading = false;
    });
  }

  close() {
    this.dialogRef.close(true);
  }
}
