import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../theme/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigService } from '../../../services/http/api-config.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit, OnDestroy {
  shortId: string;
  roomId: string;
  passwordProtected: boolean;

  qrWidth: number;
  bgColor: string;
  fgColor: string;
  destroyed$ = new Subject<void>();
  url: string;
  qrUrl: string;
  displayUrl: string;
  useJoinUrl = false;

  constructor(
    protected notification: NotificationService,
    protected translateService: TranslateService,
    private themeService: ThemeService,
    private apiConfigService: ApiConfigService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const room = this.route.snapshot.data.room;
    this.shortId = room.shortId;
    this.roomId = room.id;
    this.passwordProtected = room.passwordProtected;
    this.initQrCode();
  }

  initQrCode() {
    const minSize = Math.min(innerWidth, innerHeight);
    this.qrWidth = minSize * (innerWidth > 1279 ? 0.5 : 0.35);
    this.themeService
      .getTheme()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((theme) => {
        const currentTheme = this.themeService.getThemeByKey(theme);
        this.bgColor = currentTheme.get('surface').color;
        this.fgColor = currentTheme.get('on-surface').color;
      });
    this.apiConfigService
      .getApiConfig$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((config) => {
        let url;
        if (config.ui.links?.join) {
          url = config.ui.links.join.url;
          this.displayUrl = url.replace(/^https?:\/\//, '') + this.shortId;
          this.useJoinUrl = true;
        } else {
          url = document.baseURI + 'p/';
          this.displayUrl = document.baseURI
            .replace(/^https?:\/\//, '')
            .replace(/\/$/, '');
        }
        this.url = url + this.shortId;
        this.qrUrl = this.url + '?entry=qr';
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  copyShortId(): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.translateService.get('dialog.url-copied').subscribe((msg) => {
      this.notification.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    });
  }
}
