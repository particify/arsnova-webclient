import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConsentGiven, CookieCategory } from '../../../../services/util/consent.service';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { EventService } from '../../../../services/util/event.service';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss']
})
export class CookiesComponent implements OnInit, AfterViewInit {

  @ViewChild('header') dialogTitle: ElementRef;

  categories: CookieCategory[];
  privacyUrl: string;
  inputFocus: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { categories: CookieCategory[], privacyUrl: string },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CookiesComponent>,
    protected route: ActivatedRoute,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private eventService: EventService
  ) {
    this.categories = data.categories;
    this.privacyUrl = data.privacyUrl;
  }

  ngOnInit() {
    // not really the nicest way but should do its job until a better or native solution was found
    setTimeout(() => document.getElementById('cookie-header').focus(), 400);
    this.inputFocus = this.eventService.focusOnInput;
    this.eventService.focusOnInput = true;
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
    console.log('Accepted cookie categories: ', this.categories);
    const consentGiven: ConsentGiven = this.categories.reduce((map, item) => {
        map[item.id] = item.consent;
        return map;
      }, {});
    this.dialogRef.close(consentGiven);
    const msg = this.translateService.instant('cookies.settings-saved');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    this.eventService.focusOnInput = this.inputFocus;
    setTimeout(() => {
      document.getElementById('room-id-input').focus();
    }, 500);
  }
}
