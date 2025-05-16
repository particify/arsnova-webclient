import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  TitleStrategy,
} from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Title } from '@angular/platform-browser';
import { take } from 'rxjs';
import { PageTitleService } from './services/util/page-title.service';

@Injectable()
export class CustomPageTitleStrategy extends TitleStrategy {
  private translateService = inject(TranslocoService);
  private readonly titleService = inject(Title);
  private pageTitleService = inject(PageTitleService);

  homeTitle?: string;
  titleSuffix?: string;
  roomName?: string;
  seriesName?: string;
  title?: string;

  constructor() {
    super();
    const translateService = this.translateService;

    // Subscribe to lang changes and updated title
    translateService.langChanges$.subscribe(() => {
      // Only update title if already set
      if (this.title) {
        this.updateTitle(undefined);
      }
    });
  }

  override updateTitle(snapshot?: RouterStateSnapshot): void {
    if (snapshot) {
      this.setHomeTitle();
      this.buildTitle(snapshot);
    }
    switch (this.title) {
      case 'home':
        // Use home title
        if (this.homeTitle) {
          this.setDocumentTitle(this.homeTitle, false);
        }
        break;
      case 'room':
        // Use room name as title
        if (this.roomName) {
          this.setDocumentTitle(this.roomName);
        }
        break;
      case 'series':
        // Use series name as title
        if (this.seriesName) {
          this.setDocumentTitle(this.seriesName);
        }
        break;
      default:
        // Use tranlated title for page
        this.translateService
          .selectTranslate('title.' + this.title)
          .pipe(take(1))
          .subscribe((msg) => {
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
    this.pageTitleService.setTitle(title);
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
