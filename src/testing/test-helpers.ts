import { TranslateLoader } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BroadcastEvent } from '@arsnova/app/services/util/event.service';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Event,
  ParamMap,
  Params,
  UrlTree,
} from '@angular/router';
import { EventEmitter } from '@angular/core';
import * as TRANSLATION_DE from '../assets/i18n/home/de.json';
import * as TRANSLATION_EN from '../assets/i18n/home/en.json';
import { Theme } from '@arsnova/theme/theme.service';

// SERVICES - UTIL

// TranslateModule

const TRANSLATIONS = {
  DE: TRANSLATION_DE,
  EN: TRANSLATION_EN,
};

export class JsonTranslationLoader implements TranslateLoader {
  getTranslation(code = ''): Observable<object> {
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

  on<T>(key: any): Observable<T> {
    return this._eventBus.asObservable().pipe(
      filter((event) => event.key === key),
      map((event) => <T>event.data)
    );
  }
}

// AnnounceService

export class MockAnnounceService {
  announce(key: string, args?: any) {}
}

// GlobalStorageService

export class MockGlobalStorageService {
  getItem(key: symbol) {
    return undefined;
  }

  setItem(key: symbol, value: any) {}

  removeItem(key: symbol) {}

  handleConsentChange() {}
}

// Renderer

export class MockRenderer2 {}

// ActivatedRoute

export class ActivatedRouteStub {
  private subject = new ReplaySubject<ParamMap>();
  data: Observable<any>;
  snapshot: ActivatedRouteSnapshot;
  params: Observable<Params>;

  constructor(
    initialParams?: Params,
    data?: any,
    snapshot?: ActivatedRouteSnapshot
  ) {
    this.setParamMap(initialParams);
    this.setData(data);
    this.setSnapshot(snapshot);
    this.setParams(initialParams);
  }

  readonly paramMap = this.subject.asObservable();

  setParamMap(params?: Params) {
    this.subject.next(convertToParamMap(params));
  }

  setData(data: any) {
    this.data = of(data);
  }

  setSnapshot(snapshot: ActivatedRouteSnapshot) {
    this.snapshot = snapshot;
  }

  setParams(params: Params) {
    this.params = of(params);
  }
}

// Router

export class MockRouter {
  currentUrl = '/home';
  events: Observable<Event> = new Observable<Event>();

  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');

  get url(): string {
    return this.currentUrl;
  }

  setUrl(url: string) {
    this.currentUrl = url;
  }

  createUrlTree(params: string[]) {}

  serializeUrl(urlTree: UrlTree) {}
}

// NotificationService

export class MockNotificationService {
  show() {}

  showAdvanced() {}
}

// LangService

export class MockLangService {
  langEmitter = new EventEmitter<string>();
}

// ThemeService

export class MockThemeService {
  private currentTheme$ = new BehaviorSubject(null);
  private themes: string[];

  getCurrentTheme$(): Observable<Theme> {
    return this.currentTheme$;
  }

  getThemes(): string[] {
    return this.themes;
  }

  activate(name) {
    this.currentTheme$.next(name);
  }

  getColor(name: string) {
    return '#FFFFFF';
  }

  getCurrentTheme() {
    return 'arsnova';
  }

  getBarColors() {
    return ['#FFFFFFF'];
  }

  getLikertColors() {
    return ['#FFFFFFF'];
  }
}

// MatDialog

export class MockMatDialog {
  afterClosed() {}
}

export class MockMatDialogRef {
  beforeClosed() {
    return of({});
  }

  close() {}
}

export class MockMatDialogData {}
