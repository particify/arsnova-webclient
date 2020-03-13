import { TranslateService } from '@ngx-translate/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NotificationService } from './services/util/notification.service';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { CustomIconService } from './services/util/custom-icon.service';
import { ApiConfigService } from './services/http/api-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

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
  const mockApiConfigService = jasmine.createSpyObj('ApiConfigService', ['load']);

  beforeEach(async(() => {
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
          useValue: mockApiConfigService
        }
      ],
      imports: [
        RouterTestingModule
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
    expect(mockApiConfigService.load).toHaveBeenCalled();
  });

  it('should show a notification on sw update', () => {
    const mockSwUpdate = <MockSwUpdate> fixture.debugElement.injector.get(SwUpdate);
    const mockNotificationService = fixture.debugElement.injector.get(NotificationService);
    const spy = spyOn(mockNotificationService, 'show');

    mockSwUpdate.mockUpdateAvailableEvent();

    expect(spy).toHaveBeenCalled();
  });
});
