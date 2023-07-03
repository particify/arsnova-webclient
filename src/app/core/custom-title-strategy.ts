import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  TitleStrategy,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Injectable()
export class CustomPageTitleStrategy extends TitleStrategy {
  homeTitle: string;
  titleSuffix: string;
  roomName: string;
  seriesName: string;
  title: string;

  constructor(
    private translateService: TranslateService,
    private readonly titleService: Title
  ) {
    super();
    // Subscribe to lang changes and updated title
    translateService.onLangChange.subscribe(() => {
      // Only update title if already set
      if (this.title) {
        this.updateTitle(null);
      }
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    if (snapshot) {
      this.setHomeTitle();
      this.buildTitle(snapshot);
    }
    switch (this.title) {
      case 'home':
        // Use home title
        this.setDocumentTitle(this.homeTitle, false);
        break;
      case 'room':
        // Use room name as title
        this.setDocumentTitle(this.roomName);
        break;
      case 'series':
        // Use series name as title
        this.setDocumentTitle(this.seriesName);
        break;
      default:
        // Use tranlated title for page
        this.translateService.get('title.' + this.title).subscribe((msg) => {
          this.setDocumentTitle(msg);
        });
    }
  }

  override getResolvedTitleForRoute(route: ActivatedRouteSnapshot) {
    // Exit if no component is set
    if (!route.component) {
      return;
    }
    // Set series name if exist
    const series = route.params['seriesName'];
    if (series) {
      this.seriesName = series;
    }
    // Set room if exists
    if (route.data.room) {
      this.roomName = route.data.room.name;
    }
    // Set title of route
    if (route.title) {
      this.title = route.title;
    }
  }

  private setDocumentTitle(title: string, addSuffix = true) {
    if (addSuffix) {
      title += this.titleSuffix;
    }
    this.titleService.setTitle(title);
  }

  private setHomeTitle() {
    if (!this.homeTitle) {
      this.homeTitle = document.title;
      this.titleSuffix =
        ' | ' + (this.homeTitle.split('|')[0] || this.homeTitle);
    }
  }
}
