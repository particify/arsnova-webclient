import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockFeatureFlagService,
} from '@testing/test-helpers';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConsentService } from '@app/core/services/util/consent.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { RouterTestingModule } from '@angular/router/testing';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  const config = {
    apiConfig: {
      ui: {
        links: {
          privacy: {
            url: 'privacy',
          },
          imprint: {
            url: 'imprint',
          },
          feedback: {
            url: 'feedback',
          },
        },
      },
    },
  };

  const activatedRoute = new ActivatedRouteStub(null, config);
  const consentService = jasmine.createSpyObj('ConsentService', [
    'consentRequired',
    'openDialog',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatMenuModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        ExtensionPointModule,
        RouterLink,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: ConsentService,
          useValue: consentService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display footer if route is "" and device with is smaller than 1001', () => {
    component.viewWidth = 1000;
    fixture.detectChanges();
    component.checkToolbarCondition('');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(
      By.css('#footer-toolbar')
    );
    expect(footerContainer).not.toBeNull();
  });

  it('should display footer if route is "" and device with is bigger than 1000', () => {
    component.viewWidth = 1001;
    fixture.detectChanges();
    component.checkToolbarCondition('');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(
      By.css('#footer-toolbar')
    );
    expect(footerContainer).not.toBeNull();
  });

  it('should not display footer if route is room subroute and device width is smaller than 1001', () => {
    component.viewWidth = 1000;
    fixture.detectChanges();
    component.checkToolbarCondition('/edit/12345678/comments');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(
      By.css('#footer-toolbar')
    );
    expect(footerContainer).toBeNull();
  });

  it('should display footer if route is room subroute and device with is bigger than 1000', () => {
    component.viewWidth = 1001;
    fixture.detectChanges();
    component.checkToolbarCondition('/edit/12345678/comments');
    fixture.detectChanges();
    const footerContainer = fixture.debugElement.query(
      By.css('#footer-toolbar')
    );
    expect(footerContainer).not.toBeNull();
  });
});
