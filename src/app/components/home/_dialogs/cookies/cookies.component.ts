import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConsentGiven, CookieCategory } from '../../../../services/util/consent.service';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss']
})
export class CookiesComponent implements OnInit, AfterViewInit {

  @ViewChild('header') dialogTitle: ElementRef;

  categories: CookieCategory[];
  privacyUrl: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { categories: CookieCategory[], privacyUrl: string },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CookiesComponent>,
    protected route: ActivatedRoute
  ) {
    this.categories = data.categories;
    this.privacyUrl = data.privacyUrl;
  }

  ngOnInit() {
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
    console.log('Accepted cookie categories: ', this.categories);
    const consentGiven: ConsentGiven = this.categories.reduce((map, item) => {
        map[item.id] = item.consent;
        return map;
      }, {});
    this.dialogRef.close(consentGiven);
    setTimeout(() => {
      document.getElementById('room-id-input').focus();
    }, 500);
  }
}
