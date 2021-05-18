import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../../theme/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigService } from '../../../../services/http/api-config.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit, OnDestroy {

  @Input() shortId: string;

  qrWidth: number;
  bgColor: string;
  fgColor: string;
  destroyed$ = new Subject();
  qrUrl: string;
  displayUrl: string;
  useJoinUrl = false;

  constructor(public dialogRef: MatDialogRef<QrCodeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              protected notification: NotificationService,
              protected translateService: TranslateService,
              private themeService: ThemeService,
              private apiConfigService: ApiConfigService
  ) {}

  ngOnInit(): void {
    const shortId = this.shortId || this.data.shortId;
    const minSize = Math.min(document.body.clientWidth, document.body.clientHeight);
    this.qrWidth = minSize * 0.75;
    this.themeService.getTheme().pipe(takeUntil(this.destroyed$)).subscribe(theme => {
      const currentTheme = this.themeService.getThemeByKey(theme);
      this.bgColor = currentTheme.get('surface').color;
      this.fgColor = currentTheme.get('on-surface').color;
    });
    this.apiConfigService.getApiConfig$().pipe(takeUntil(this.destroyed$)).subscribe(config => {
      let url;
      if (config.ui.links?.join) {
        url = config.ui.links.join.url;
        this.displayUrl = url.replace(/^https?:\/\//, '') + shortId;
        this.useJoinUrl = true;
      } else {
        url = document.baseURI + 'join/';
        this.displayUrl = document.baseURI.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
      this.qrUrl = url + shortId;
    });
    if (this.shortId) {
      setTimeout(() => {
        document.getElementById('qr-message').focus();
      }, 700);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  copyShortId(): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.qrUrl;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.translateService.get('header.room-id-copied').subscribe(msg => {
      this.notification.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    });
  }
}
