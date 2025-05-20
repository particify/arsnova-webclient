import { Component, OnInit, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { VersionReadyEvent } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { VersionInfo } from '@app/core/models/version-info';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { LoadingIndicatorComponent } from '../../../standalone/loading-indicator/loading-indicator.component';
import { FlexModule } from '@angular/flex-layout';
import { MatButton } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

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
  imports: [
    CdkScrollable,
    MatDialogContent,
    LoadingIndicatorComponent,
    MatDialogActions,
    FlexModule,
    MatButton,
    TranslocoPipe,
  ],
})
export class UpdateInfoComponent implements OnInit {
  dialogRef = inject<MatDialogRef<UpdateInfoComponent>>(MatDialogRef);
  private data = inject<DialogData>(MAT_DIALOG_DATA);
  private apiConfigService = inject(ApiConfigService);
  private globalStorageService = inject(GlobalStorageService);

  readonly dialogId = 'update-info';

  isLoading = true;
  changes?: string[] = [];
  newsUrl?: string;
  afterUpdate = false;
  versions: VersionInfo[];
  updateReady = false;
  inputFocus = false;

  constructor() {
    const data = this.data;

    this.afterUpdate = data.afterUpdate;
    this.versions = data.versions ?? [];
  }

  ngOnInit(): void {
    const lang = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    this.changes = this.versions
      .filter((v) => v.changes?.[lang]?.length > 0)
      .reduce(
        (acc: VersionInfo | undefined, cur) =>
          cur.id > (acc?.id ?? 0) ? cur : acc,
        undefined
      )?.changes?.[lang];
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
