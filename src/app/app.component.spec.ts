import { TranslateService } from '@ngx-translate/core';
import { TestBed, ComponentFixture, waitForAsync, fakeAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CustomIconService } from './services/util/custom-icon.service';
import { ApiConfigService } from './services/http/api-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Injectable, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { TrackingService } from './services/util/tracking.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiConfig } from './models/api-config';
import { ConsentService } from './services/util/consent.service';
import { UpdateService } from './services/util/update.service';
import { UpdateImportance } from './models/version-info';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { MockTranslateService } from '@arsnova/testing/test-helpers';

// Stub for downstream template
@Component({selector: 'app-header', template: ''})
class HeaderStubComponent {
}

// Stub for downstream template
@Component({selector: 'app-footer', template: ''})
class FooterStubComponent {
}

describe('AppComponent', () => {
  let appComponent: AppComponent;
  // let's you access the debug elements to gain control over injected services etc.
  let fixture: ComponentFixture<AppComponent>;

  const customIconService = jasmine.createSpyObj('CustomIconService', ['init']);
  const updateService = jasmine.createSpyObj('UpdateService', ['handleUpdate']);
  const trackingService = jasmine.createSpyObj('TrackingService', ['init']);
  const apiConfigService = jasmine.createSpyObj('ApiConfigService', ['getApiConfig$']);
  const consentService = jasmine.createSpyObj('ConsentService', ['setConfig']);
  const routingService = jasmine.createSpyObj('RoutingService', ['subscribeActivatedRoute']);

  let translateService: TranslateService;

  let getApiConfig$Spy: jasmine.Spy;
  let testApiConfig: ApiConfig;

  beforeEach(waitForAsync(() => {

    testApiConfig = {
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
      },
      authenticationProviders: [],
      features: {}
    };

    getApiConfig$Spy = apiConfigService.getApiConfig$.and.returnValue(of(testApiConfig));
@Injectable()
class MockLanguageService {
  public readonly langEmitter = new EventEmitter<string>();
}


    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderStubComponent,
        FooterStubComponent
      ],
      providers: [
        AppComponent,
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: CustomIconService,
          useValue: customIconService
        },

        {
          provide: ApiConfigService,
          useValue: apiConfigService
        },
        {
          provide: TrackingService,
          useValue: trackingService
        },
        {
          provide: ConsentService,
          useValue: consentService
        },
        {
          provide: UpdateService,
          useValue: updateService
        },
        {
          provide: RoutingService,
          useValue: routingService
        },
        {
          provide: LanguageService,
          useClass: MockLanguageService
        }
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ]
    });
    fixture = TestBed.createComponent(AppComponent);
    appComponent = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
  }));

  it('should create the app', () => {
    fixture.detectChanges();
    expect(appComponent).toBeTruthy();
  });

  it('should have a title', () => {
    fixture.detectChanges();
    expect(appComponent.title).toEqual('ARSnova');
  });

  it('should call the API config', fakeAsync(() => {
    fixture.detectChanges();
    expect(apiConfigService.getApiConfig$).toHaveBeenCalled();
  }));

  it('should call the tracking service init on getting a tracking config', () => {
    fixture.detectChanges();
    expect(trackingService.init).toHaveBeenCalled();
  });

  it('should call the update service to handle update', () => {
    fixture.detectChanges();
    expect(updateService.handleUpdate).toHaveBeenCalled();
  });

  it('should call the consent service to set settings', () => {
    fixture.detectChanges();
    expect(consentService.setConfig).toHaveBeenCalled();
  });

  it('default lang should has been set after init', () => {
    expect(translateService.defaultLang).toBeUndefined('lang should be undefined before init');
    fixture.detectChanges();
    expect(translateService.defaultLang).toContain('de', 'lang should be "de" after init');
  });

  it('should call the routing service to start route subscription', () => {
    fixture.detectChanges();
    expect(routingService.subscribeActivatedRoute).toHaveBeenCalled();
  });
});
