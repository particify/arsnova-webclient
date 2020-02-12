import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogConfirmActionButtonType } from '../../../shared/dialog/dialog-action-buttons/dialog-action-buttons.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiConfigService } from '../../../../services/http/api-config.service';

@Component({
  selector: 'app-data-protection',
  templateUrl: './data-protection.component.html',
  styleUrls: ['./data-protection.component.scss']
})
export class DataProtectionComponent implements OnInit {

  privacyContent: any;
  confirmButtonType: DialogConfirmActionButtonType;

  constructor(private router: Router,
              private dialogRef: MatDialogRef<DataProtectionComponent>,
              private apiConfigService: ApiConfigService) {
    this.confirmButtonType = DialogConfirmActionButtonType.Primary;
  }

  ngOnInit() {
    const lang = localStorage.getItem('currentLang');
    this.privacyContent =  this.getPrivacyInfo(lang);
  }

  getPrivacyInfo(lang: string) {
    return this.apiConfigService.getUiConfig()['privacy-info'][lang];
  }

  accept() {
    this.dataProtectionConsent(true);
    this.dialogRef.close(true);
  }

  decline() {
    this.dataProtectionConsent(false);

    // TODO: Delete all user data (backend)

    if (this.router.url === '/home') {

      // if current route is /home : do nothing

    } else {      // otherwise: go there
      this.router.navigate(['/home']);
    }
    this.dialogRef.close(false);
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildDeclineActionCallback(): () => void {
    return () => this.decline();
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildConfirmActionCallback(): () => void {
    return () => this.accept();
  }


  dataProtectionConsent(b: boolean) {
    localStorage.setItem('dataProtectionConsent', b.toString());
  }
}
