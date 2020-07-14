import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogConfirmActionButtonType } from '../../../shared/dialog/dialog-action-buttons/dialog-action-buttons.component';
import { ApiConfigService } from '../../../../services/http/api-config.service';
import { InfoDialogComponent } from '../../../shared/_dialogs/info-dialog/info-dialog.component';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ConsentGiven, CookieCategory } from 'app/services/util/consent.service';

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
    @Inject(MAT_DIALOG_DATA) public categories: CookieCategory[],
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
    this.categories.forEach((item) => {
      item.consent = true;
    });
    this.handleCookieSelection();
  }

  acceptSelectedCookies() {
    this.handleCookieSelection();
  }

  handleCookieSelection() {
    console.debug('Accepted cookie categories: ', this.categories);
    const consentGiven: ConsentGiven = this.categories.reduce((map, item) => {
        map[item.id] = item.consent
        return map;
      }, {});
    this.dialogRef.close(consentGiven);
    setTimeout(() => {
      document.getElementById('room-id-input').focus();
    }, 500);
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
