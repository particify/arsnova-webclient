import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogConfirmActionButtonType } from '../../../shared/dialog/dialog-action-buttons/dialog-action-buttons.component';
import { ApiConfigService } from '../../../../services/http/api-config.service';
import { InfoDialogComponent } from '../../../shared/_dialogs/info-dialog/info-dialog.component';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';

interface CookieCategory {
  id: string,
  required: boolean
  consent: boolean
}

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss']
})
export class CookiesComponent implements OnInit, AfterViewInit {

  @ViewChild('header')
  dialogTitle: ElementRef;

  currentLang: string;

  confirmButtonType: DialogConfirmActionButtonType = DialogConfirmActionButtonType.Primary;

  categories: CookieCategory[] = [
    {id: 'essential', consent: true, required: true},
    {id: 'functional', consent: false, required: false},
    {id: 'statistics', consent: false, required: false}
  ]

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CookiesComponent>,
    private apiConfigService: ApiConfigService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.currentLang = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    // not really the nicest way but should do its job until a better or native solution was found
    setTimeout(() => document.getElementById('cookie-header').focus(), 400);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      document.getElementById('cookie-header').focus();
    }, 500);
  }

  acceptAllCookies() {
    console.debug('Accepted cookie categories: ', this.categories);
    this.categories.forEach((item) => {
      item.consent = true;
    });
    this.updateConsentSettings();
    this.dialogRef.close(true);
    setTimeout(() => {
      document.getElementById('room-id-input').focus();
    }, 500);
  }

  acceptSelectedCookies() {
    console.debug('Accepted cookie categories: ', this.categories);
    this.updateConsentSettings();
    this.dialogRef.close(true);
    setTimeout(() => {
      document.getElementById('room-id-input').focus();
    }, 500);
  }

  updateConsentSettings() {
    this.globalStorageService.setItem(STORAGE_KEYS.COOKIE_CONSENT, true);
  }

  getUIDataFromConfig(type: string): string {
    return this.apiConfigService.getUiConfig()[type][this.currentLang];
  }

  showDataProtection() {
    this.dialog.open(InfoDialogComponent, {
      'width': '80%',
      data: {
        section: 'data-protection',
        body: this.getUIDataFromConfig('privacy-info')
      }
    });
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildConfirmActionCallback(): () => void {
    return () => this.acceptAllCookies();
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildCancelActionCallback(): () => void {
    return () => this.acceptSelectedCookies();
  }
}
