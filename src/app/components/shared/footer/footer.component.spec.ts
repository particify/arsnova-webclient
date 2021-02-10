import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import {
  ActivatedRouteStub, JsonTranslationLoader,
  MockLangService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { ConsentService } from '@arsnova/app/services/util/consent.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  const config = {
    apiConfig: {
      ui: {
        links: {
          privacy: {
            url: 'privacy'
          },
          imprint: {
            url: 'imprint'
          },
          feedback: {
            url: 'feedback'
          }
        }
      }
    }
  };

  const activatedRoute = new ActivatedRouteStub(null, config);
  let routerSpy = jasmine.createSpyObj('MockRouter', ['navigate']);
  const consentService = jasmine.createSpyObj('ConsentService', ['consentRequired', 'openDialog']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterComponent ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatMenuModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        FooterComponent,
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
        {
          provide: ConsentService,
          useValue: consentService
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display footer if route is "/home" and device with is smaller than 1001', () => {
    component.viewWidth = 1000;
    fixture.detectChanges();
    component.checkToolbarCondition('/home');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(By.css('#footer-toolbar'));
    expect(footerContainer).not.toBeNull();
  });

  it('should display footer if route is "/home" and device with is bigger than 1000', () => {
    component.viewWidth = 1001;
    fixture.detectChanges();
    component.checkToolbarCondition('/home');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(By.css('#footer-toolbar'));
    expect(footerContainer).not.toBeNull();
  });

  it('should not display footer if route is room subroute and device width is smaller than 1001', () => {
    component.viewWidth = 1000;
    fixture.detectChanges();
    component.checkToolbarCondition('/creator/room/12345678/comments');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(By.css('#footer-toolbar'));
    expect(footerContainer).toBeNull();
  });

  it('should display footer if route is room subroute and device with is bigger than 1000', () => {
    component.viewWidth = 1001;
    fixture.detectChanges();
    component.checkToolbarCondition('/creator/room/12345678/comments');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(By.css('#footer-toolbar'));
    expect(footerContainer).not.toBeNull();
  });

});
