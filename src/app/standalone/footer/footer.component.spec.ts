import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import {
  ActivatedRouteStub,
  MockFeatureFlagService,
} from '@testing/test-helpers';
import { ActivatedRoute } from '@angular/router';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { RoutingService } from '@app/core/services/util/routing.service';

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

  const activatedRoute = new ActivatedRouteStub(undefined, config);

  const routingService = jasmine.createSpyObj('RoutingService', [
    'showFooterLinks',
  ]);
  routingService.showFooterLinks.and.returnValue(of(false));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        getTranslocoModule(),
        ExtensionPointModule,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: RoutingService,
          useValue: routingService,
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
});
