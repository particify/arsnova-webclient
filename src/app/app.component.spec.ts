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
import { EventService } from './services/util/event.service';
import { UpdateService } from './services/util/update-service';
import { UpdateImportance } from './models/version-info';

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

  public showAdvanced() {
  }
}

@Injectable()
class MockDialogService {
  public openUpdateInfoDialog = jasmine.createSpy('OpenUpdateInfoDialogSpy').and.returnValue({
    afterClosed: () => new Subject()
  });
}

@Injectable()
class MockEventService {
  public broadcast() {
  }
}

@Injectable()
class MockGlobalStorageService {
  private memory: Map<symbol, any> = new Map();

  constructor(initialState: [[symbol, any]]) {
    initialState.forEach(item => this.setItem(item[0], item[1]));
  }

  public getItem(key: symbol): any {
    return this.memory.get(key);
  }

  public setItem(key: symbol, value: any) {
    this.memory.set(key, value);
  }

  public removeItem(key: symbol) {
    this.memory.delete(key);
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
      },
      versions: [
        {
          id: 100001,
          commitHash: '1111111111111111111111111111111111111111',
          importance: UpdateImportance.RECOMMENDED,
          changes: {
            en: [
              'a change entry'
            ]
          }
        },
        {
          id: 100000,
          commitHash: '0000000000000000000000000000000000000000',
          importance: UpdateImportance.RECOMMENDED,
          changes: {
            en: [
              'a change entry'
            ]
          }
        }
      ]
    }
  };

  private apiConfig = new Subject<any>();
  public load = jasmine.createSpy('ApiConfigServiceLoadSpy');

  constructor(private httpClient: HttpClient, protected eventService: EventService) {
    super(
      httpClient,
      eventService,
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
          useFactory: () => new MockGlobalStorageService(
              [
                [
                  STORAGE_KEYS.LATEST_ANNOUNCED_VERSION,
                  '0000000000000000000000000000000000000000'
                ]
              ])
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: UpdateService,
          useClass: UpdateService
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
    const mockDialogService = fixture.debugElement.injector.get(DialogService);
    mockSwUpdate.mockUpdateAvailableEvent();
    expect(mockDialogService.openUpdateInfoDialog).toHaveBeenCalled();
  });

  it('should call the tracking service init on getting a tracking config', () => {
    const mockApiConfigService = <MockApiConfigService> fixture.debugElement.injector.get(ApiConfigService);
    const mockTrackingService = fixture.debugElement.injector.get(TrackingService);
    const spy = spyOn(mockTrackingService, 'init');

    mockApiConfigService.mockApiConfigEvent();

    expect(spy).toHaveBeenCalled();
  });
});
