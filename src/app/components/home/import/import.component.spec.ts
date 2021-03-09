import { Injectable, Component, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ImportComponent } from './import.component';
import { RoomService } from '../../../services/http/room.service';
import { NotificationService } from '../../../services/util/notification.service';
import { Router } from '@angular/router';
import { LanguageService } from '../../../services/util/language.service';

const TRANSLATION_DE = require('../../../../assets/i18n/home/de.json');
const TRANSLATION_EN = require('../../../../assets/i18n/home/en.json');

const TRANSLATIONS = {
  DE: TRANSLATION_DE,
  EN: TRANSLATION_EN
};

class JsonTranslationLoader implements TranslateLoader {
  getTranslation(code: string = ''): Observable<object> {
    if (code !== null) {
      const uppercased = code.toUpperCase();

      return of(TRANSLATIONS[uppercased]);
    } else {
      return of({});
    }
  }
}

@Injectable()
class MockRouter {

}

@Injectable()
class MockRoomService {

}

@Injectable()
class MockAuthenticationService {
  isLoggedIn() {
    return of(true);
  }
}

@Injectable()
class MockNotificationService {

}

@Injectable()
class MockLanguageService {
  public readonly langEmitter = new EventEmitter<string>();
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
      declarations: [
        ImportComponent,
        MatCardStubComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: LanguageService,
          useClass: MockLanguageService
        }
      ]
    }).compileComponents()
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
