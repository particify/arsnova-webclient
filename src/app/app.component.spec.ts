import { TranslateService } from '@ngx-translate/core';
import { TestBed, ComponentFixture, tick, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NotificationService } from './services/util/notification.service';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { CustomIconService } from './services/util/custom-icon.service';
import { ApiConfigService } from './services/http/api-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { TrackingService } from './services/util/tracking.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { DialogService } from './services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from './services/util/global-storage.service';

@Injectable()
class MockTranslateService {
  public get(key: string): Observable<String> {
    return of (key);
  }

  public setDefaultLang(lang: string) {
  }

  public getBrowserLang() {
    return '';
  }
}

// Mock class for the notification service
@Injectable()
class MockNotificationService {
  public snackRef = {
    afterDismissed: () => {
      return of();
    }
  };

  public show(msg: string, install: string, config: any) {
  }
}

@Injectable()
class MockDialogService {
  public openUpdateInfoDialog() {
    return {
      afterClosed(): Observable<string> {
        return of('any');
      }
    };
  }
}

@Injectable()
class MockGlobalStorageService {
  public getItem(key: string): string {
    return '';
  }

  public setItem(key: string, value: any) {
  }

  public removeItem(key: string) {
  }
}

// Mock class for the tracking service
@Injectable()
class MockApiConfigService extends ApiConfigService {
  private mockApiConfig = {
    ui: {
      tracking: {
        url: 'mock-tracker',
        provider: 'matomo'
      }
    }
  };

  private apiConfig = new Subject<any>();
  public load = jasmine.createSpy('ApiConfigServiceLoadSpy');

  constructor(private httpClient: HttpClient) {
    super(
      httpClient,
      jasmine.createSpyObj('TranslateServiceSpy', ['get']),
      jasmine.createSpyObj('NotificationServiceSpy', ['showAdvanced'])
    );
  }

  public getApiConfig$() {
    return this.apiConfig.asObservable();
  }

  public mockApiConfigEvent() {
    this.apiConfig.next(this.mockApiConfig);
  }
}

// Mock class for the tracking service
@Injectable()
class MockTrackingService {
  public init(object: any) {

  }
}

// Mock class for the Window
@Injectable()
class MockWindow {
  public location = class {
    public reload = jasmine.createSpy('WindowReloadSpy');
  };
}

// Mock class for the service worker update
@Injectable()
class MockSwUpdate extends SwUpdate {
  private availableSubject = new Subject<UpdateAvailableEvent>();

  public available: Observable<UpdateAvailableEvent> = this.availableSubject.asObservable();

  constructor() {
    super(jasmine.createSpyObj('NgswCommChannel', ['eventsOfType']));
  }

  public mockUpdateAvailableEvent() {
    this.availableSubject.next(
      {
        type: 'UPDATE_AVAILABLE',
        current: {
          hash: '1'
        },
        available: {
          hash: '2'
        }
      }
    );
  }
}

// Stub for downstream template
@Component({ selector: 'app-header', template: '' })
class HeaderStubComponent {}

// Stub for downstream template
@Component({ selector: 'app-footer', template: '' })
class FooterStubComponent {}

describe('AppComponent', () => {
  let appComponent: AppComponent;
  // let's you access the debug elements to gain control over injected services etc.
  let fixture: ComponentFixture<AppComponent>;

  // create simple spy objects for downstream dependencies
  const mockCustomIconService = jasmine.createSpyObj('CustomIconService', ['init']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderStubComponent,
        FooterStubComponent
      ],
      providers: [
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: SwUpdate,
          useClass: MockSwUpdate
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: CustomIconService,
          useValue: mockCustomIconService
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService
        },
        {
          provide: TrackingService,
          useClass: MockTrackingService
        },
        {
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: Window,
          useClass: MockWindow
        }
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ]
    }).compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      appComponent = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create the app', () => {
    expect(appComponent).toBeTruthy();
  });

  it('should have a title', () => {
    expect(appComponent.title).toEqual('ARSnova');
  });

  it('should call the API config', () => {
    const mockApiConfigService = fixture.debugElement.injector.get(ApiConfigService);
    expect(mockApiConfigService.load).toHaveBeenCalled();
  });

  it('should show a dialog on sw update', () => {
    const mockSwUpdate = <MockSwUpdate> fixture.debugElement.injector.get(SwUpdate);
    const mockGlobalStorageService = fixture.debugElement.injector.get(GlobalStorageService);
    const $window = fixture.debugElement.injector.get(Window);
    const spy = spyOn(mockGlobalStorageService, 'setItem');
    delete $window.location;
    $window.location = Object();
    $window.location.reload = () => {};
    const reloadSpy = spyOn($window.location, 'reload');

    mockSwUpdate.mockUpdateAvailableEvent();

    expect(spy).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should call the tracking service init on getting a tracking config', () => {
    const mockApiConfigService = <MockApiConfigService> fixture.debugElement.injector.get(ApiConfigService);
    const mockTrackingService = fixture.debugElement.injector.get(TrackingService);
    const spy = spyOn(mockTrackingService, 'init');

    mockApiConfigService.mockApiConfigEvent();

    expect(spy).toHaveBeenCalled();
  });
});
