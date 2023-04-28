import { Injectable, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ImportComponent } from './import.component';
import { RoomService } from '@app/core/services/http/room.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Router } from '@angular/router';
import { LanguageService } from '@app/core/services/util/language.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  JsonTranslationLoader,
  MockLangService,
  MockNotificationService,
} from '@testing/test-helpers';

@Injectable()
class MockRouter {}

@Injectable()
class MockRoomService {}

@Injectable()
class MockAuthenticationService {
  isLoggedIn() {
    return of(true);
  }
}

@Injectable()
class MockRoutingServie {
  setRedirect() {}
}

/* eslint-disable @angular-eslint/component-selector */
@Component({ selector: 'mat-card', template: '<ng-content></ng-content>' })
class MatCardStubComponent {}
/* eslint-enable @angular-eslint/component-selector */

describe('ImportComponent', () => {
  let component: ImportComponent;
  let fixture: ComponentFixture<ImportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImportComponent, MatCardStubComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingServie,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
