import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationDrawerComponent } from './navigation-drawer.component';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ActivatedRouteStub,
  MockFeatureFlagService,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { of } from 'rxjs';
import { RoutingService } from '@app/core/services/util/routing.service';

describe('NavigationDrawerComponent', () => {
  let component: NavigationDrawerComponent;
  let fixture: ComponentFixture<NavigationDrawerComponent>;

  const snapshot = new ActivatedRouteSnapshot();
  Object.defineProperty(snapshot, 'firstChild', {
    value: { url: [{ path: 'path' }] },
  });
  const activatedRoute = new ActivatedRouteStub(undefined, undefined, snapshot);

  const routingService = jasmine.createSpyObj('RoutingService', [
    'showFooterLinks',
  ]);
  routingService.showFooterLinks.and.returnValue(of(false));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        BrowserAnimationsModule,
        NavigationDrawerComponent,
        RouterTestingModule,
        FooterComponent,
        getTranslocoModule(),
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
    });
    fixture = TestBed.createComponent(NavigationDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
