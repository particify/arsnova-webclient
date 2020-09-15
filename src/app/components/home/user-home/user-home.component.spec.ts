import { Injectable, Renderer2, Component, EventEmitter, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { UserHomeComponent } from './user-home.component';
import { MatDialog } from '@angular/material/dialog';

import { EventService } from '../../../services/util/event.service';
import { LanguageService } from '../../../services/util/language.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

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
class MockMatDialog {

}

@Injectable()
class MockDialogService {

}

@Injectable()
class MockLanguageService {
  public readonly langEmitter = new EventEmitter<string>();
}

@Injectable()
class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(null);
  }
}

@Injectable()
class MockEventService {
}

@Injectable()
class MockAnnouncer {

}

@Injectable()
class MockRenderer2 {

}

@Injectable()
class MockGlobalStorageService {
  getItem(key: symbol) {
    return undefined;
  }

  setItem(key: symbol, value: any) {
  }

  removeItem(key: symbol) {
  }
}

@Component({ selector: 'app-room-join', template: '' })
class RoomJoinStubComponent {
  @Input() inputA11yString;
}

@Component({ selector: 'app-room-list', template: '' })
class RoomListStubComponent {
  @Input() auth: ClientAuthentication;
}

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent { }


describe('UserHomeComponent', () => {
  let component: UserHomeComponent;
  let fixture: ComponentFixture<UserHomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserHomeComponent,
        RoomJoinStubComponent,
        RoomListStubComponent,
        MatIconStubComponent
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
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog
        },
        {
          provide: LanguageService,
          useClass: MockLanguageService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: AnnounceService,
          useClass: MockAnnouncer
        },
        {
          provide: Renderer2,
          useClass: MockRenderer2
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
      ]
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(UserHomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
