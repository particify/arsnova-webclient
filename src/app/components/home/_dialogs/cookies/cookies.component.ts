import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogConfirmActionButtonType } from '../../../shared/dialog/dialog-action-buttons/dialog-action-buttons.component';
import { ApiConfigService } from '../../../../services/http/api-config.service';
import { InfoDialogComponent } from '../../../shared/_dialogs/info-dialog/info-dialog.component';
import { GlobalStorageService, LocalStorageKey } from '../../../../services/util/global-storage.service';

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

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CookiesComponent>,
    private ref: ElementRef,
    private apiConfigService: ApiConfigService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.currentLang = this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE);
    // not really the nicest way but should do its job until a better or native solution was found
    setTimeout(() => document.getElementById('cookie-header').focus(), 400);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      document.getElementById('cookie-header').focus();
    }, 500);
  }

  acceptCookies() {
    this.globalStorageService.setLocalStorageItem(LocalStorageKey.COOKIE_CONSENT, 'true');
    this.globalStorageService.setLocalStorageItem(LocalStorageKey.DATA_PROTECTION, 'true');
    this.dialogRef.close(true);
    setTimeout(() => {
      document.getElementById('room-id-input').focus();
    }, 500);
  }

  exitApp() {
    this.globalStorageService.setLocalStorageItem(LocalStorageKey.COOKIE_CONSENT, 'false');
    // TODO somehow exit the app, since the user didn't accept cookie usage
    this.dialogRef.close(false);
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
    return () => this.acceptCookies();
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildDeclineActionCallback(): () => void {
    return () => this.exitApp();
  }
}
