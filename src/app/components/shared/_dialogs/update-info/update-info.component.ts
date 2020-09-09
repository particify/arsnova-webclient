import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiConfigService } from '../../../../services/http/api-config.service';

@Component({
  selector: 'app-update-info',
  templateUrl: './update-info.component.html',
  styleUrls: ['./update-info.component.scss']
})
export class UpdateInfoComponent implements OnInit {

  isLoading = true;
  keywords: string[] = [];
  newsUrl: string;

  constructor(public dialogRef: MatDialogRef<UpdateInfoComponent>,
              private apiConfigService: ApiConfigService) { }

  ngOnInit(): void {
    this.apiConfigService.getApiConfig$().subscribe(config => {
      for (const listItem of config.ui.update.changes) {
        this.keywords.push(listItem);
      }
      this.newsUrl = config.ui.links.news.url;
      this.isLoading = false;
    });
  }

  close() {
    this.dialogRef.close();
  }

}
