import { TranslateLoader } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BroadcastEvent } from '@arsnova/app/services/util/event.service';
import { convertToParamMap, Event, ParamMap, Params } from '@angular/router';
import { Theme } from '@arsnova/theme/Theme';
import { EventEmitter } from '@angular/core';

// SERVICES - UTIL

// TranslateModule

const TRANSLATION_DE = require('../assets/i18n/home/de.json');
const TRANSLATION_EN = require('../assets/i18n/home/en.json');

const TRANSLATIONS = {
  DE: TRANSLATION_DE,
  EN: TRANSLATION_EN
};

export class JsonTranslationLoader implements TranslateLoader {
  getTranslation(code: string = ''): Observable<object> {
    const uppercased = code.toUpperCase();

    return of(TRANSLATIONS[uppercased]);
  }
}

export class MockTranslateService {
  currentLang: string;
  defaultLang: string;

  getBrowserLang(): string {
    return 'de';
  }

  setDefaultLang(lang: string): void {
    this.defaultLang = lang;
  }

  getDefaultLang(): string {
    return this.defaultLang;
  }
  get(): string {
    return this.currentLang;
  }

  use(lang: string) {
    this.currentLang = lang;
  }
}

// EventService

export class MockEventService {
  private _eventBus = new Subject<BroadcastEvent>();
  focusOnInput: boolean;

  broadcast = jasmine.createSpy('BroadcastSpy').and.returnValue({});

  makeFocusOnInputTrue() {
    this.focusOnInput = true;
  }

  makeFocusOnInputFalse() {
    this.focusOnInput = false;
  }

  on<T>(key: any): Observable<T> {
    return this._eventBus.asObservable().pipe(
      filter(event => event.key === key),
      map(event => <T>event.data)
    );
  }
}

// AnnounceService

export class MockAnnounceService {
  announce(key: string, args?: any) {
  }
}

// GlobalStorageService

export class MockGlobalStorageService {
  getItem(key: symbol) {
    return undefined;
  }

  setItem(key: symbol, value: any) {
  }

  removeItem(key: symbol) {
  }
}

// Renderer

export class MockRenderer2 {
}

// ActivatedRoute

export class ActivatedRouteStub {
  private subject = new ReplaySubject<ParamMap>();
  data: Observable<any>;

  constructor(initialParams?: Params, data?: any) {
    this.setParamMap(initialParams);
    this.setData(data);
  }

  readonly paramMap = this.subject.asObservable();

  setParamMap(params?: Params) {
    this.subject.next(convertToParamMap(params));
  }

  setData(data: any) {
    this.data = of(data);
  }
}

// Router

export class MockRouter {
  currentUrl = '/home';
  events: Observable<Event> = new Observable<Event>();

  navigate = jasmine.createSpy('navigate');

  get url(): string {
    return this.currentUrl;
  }

  setUrl(url: string) {
    this.currentUrl = url;
  }

}

// NotificationService

export class MockNotificationService {
}

// LangService

export class MockLangService {
  langEmitter = new EventEmitter<string>();
}

// ThemeService

export class MockThemeService {
  private activeTheme = new BehaviorSubject(null);
  private themes: Theme[];

  getTheme(): Observable<any> {
    return this.activeTheme.asObservable();
  }

  public getThemes(): Theme[] {
    return this.themes;
  }

  public activate(name) {
    this.activeTheme.next(name);
  }
}
