import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiConfigService } from '../../../../services/http/api-config.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';

@Component({
  selector: 'app-update-info',
  templateUrl: './update-info.component.html',
  styleUrls: ['./update-info.component.scss']
})
export class UpdateInfoComponent implements OnInit {

  isLoading = true;
  keywords: string[] = [];
  newsUrl: string;
  showReleaseNotes = false;

  constructor(public dialogRef: MatDialogRef<UpdateInfoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: boolean,
              private apiConfigService: ApiConfigService,
              private globalStorageService: GlobalStorageService) { }

  ngOnInit(): void {
    const lang = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    const version = this.globalStorageService.getItem(STORAGE_KEYS.VERSION);
    this.apiConfigService.getApiConfig$().subscribe(config => {
      const latestVersion = config.ui.version.id;
      if (!version || version < latestVersion) {
        this.showReleaseNotes = true;
        this.keywords = config.ui.version.changes[lang];
        this.newsUrl = config.ui.links.news.url;
        this.globalStorageService.setItem(STORAGE_KEYS.VERSION, latestVersion);
      }
      this.isLoading = false;
    });
  }

  close() {
    this.dialogRef.close();
  }

}
