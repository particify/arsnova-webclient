import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Event,
  ParamMap,
  Params,
} from '@angular/router';
import { Theme } from '@app/core/theme/theme.service';

// TranslateModule

export class MockTranslocoService {
  currentLang?: string;
  defaultLang = 'en';

  setDefaultLang(lang: string): void {
    this.defaultLang = lang;
  }

  getDefaultLang(): string {
    return this.defaultLang;
  }

  setActiveLang(lang: string) {
    this.currentLang = lang;
  }
}

// Renderer

export class MockRenderer2 {}

// ActivatedRoute

export class ActivatedRouteStub {
  private subject = new ReplaySubject<ParamMap>();
  data?: Observable<any>;
  snapshot?: ActivatedRouteSnapshot;
  params?: Observable<Params | undefined>;

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
    if (params) {
      this.subject.next(convertToParamMap(params));
    }
  }

  setData(data: any) {
    this.data = of(data);
  }

  setSnapshot(snapshot?: ActivatedRouteSnapshot) {
    this.snapshot = snapshot;
  }

  setParams(params?: Params) {
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

  createUrlTree() {}

  serializeUrl() {}
}

// ThemeService

export class MockThemeService {
  private currentTheme$ = new BehaviorSubject<Theme | null>(null);
  private themes: string[] = [];

  getCurrentTheme$(): Observable<Theme | null> {
    return this.currentTheme$;
  }

  getThemes(): string[] {
    return this.themes;
  }

  activate(theme: Theme) {
    this.currentTheme$.next(theme);
  }

  getColor() {
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

  getPrimaryColor() {
    return '#FF0000';
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

// FeatureFlagService

export class MockFeatureFlagService {
  isEnabled() {
    return true;
  }
}
