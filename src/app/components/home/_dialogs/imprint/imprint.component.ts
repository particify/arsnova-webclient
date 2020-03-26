import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiConfigService } from '../../../../services/http/api-config.service';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent implements OnInit {

  imprintContent: string;

  constructor(private dialogRef: MatDialogRef<ImprintComponent>,
              private apiConfigService: ApiConfigService) {
  }

  ngOnInit() {
    const lang = localStorage.getItem('currentLang');
    this.imprintContent = this.getLegalInfo(lang);
  }

  getLegalInfo(lang: string) {
    return this.apiConfigService.getUiConfig()['legal-info'][lang];
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildDeclineActionCallback(): () => void {
    return () => this.dialogRef.close();
  }
}
