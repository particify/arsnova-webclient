import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomJoinComponent } from './room-join.component';
import { Injectable, Component, Input } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoomService } from '../../../services/http/room.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ModeratorService } from '../../../services/http/moderator.service';
import { EventService } from '../../../services/util/event.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { ApiConfigService } from '../../../services/http/api-config.service';

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
class MockRoomService {

}

@Injectable()
class MockApiConfigService extends ApiConfigService {
  private mockApiConfig = {
    ui: {
      demo: '11223344'
    }
  };

  private apiConfig = new Subject<any>();

  constructor() {
    super(
      jasmine.createSpyObj('HttpClientSpy', ['get'])
    );
  }

  public getApiConfig$() {
    return this.apiConfig.asObservable();
  }

  public mockApiConfigEvent() {
    this.apiConfig.next(this.mockApiConfig);
  }
}

@Injectable()
class MockRouter {

}

@Injectable()
class MockNotificationService {

}

@Injectable()
class MockAuthenticationService {
  private auth$$ = new BehaviorSubject(new BehaviorSubject(null));

  getAuthenticationChanges() {
    return this.auth$$.asObservable();
  }
}

@Injectable()
class MockModeratorService {

}

@Injectable()
class MockEventService {

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

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent { }

@Component({ selector: 'mat-placeholder', template: '' })
class MatPlaceholderStubComponent { }

@Component({ selector: 'mat-form-field', template: '' })
class MatFormFieldStubComponent { }

@Component({ selector: 'mat-error', template: '' })
class MatErrorStubComponent { }

@Component({ selector: 'mat-card', template: '' })
class MatCardStubComponent { }

@Component({ selector: 'mat-label', template: '' })
class MatLabelStubComponent { }

@Component({ selector: 'input', template: '' })
class InputStubComponent {
  @Input() formControl;
  @Input() errorStateMatcher;
}

describe('RoomJoinComponent', () => {
  let component: RoomJoinComponent;
  let fixture: ComponentFixture<RoomJoinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RoomJoinComponent,
        MatIconStubComponent,
        MatPlaceholderStubComponent,
        MatFormFieldStubComponent,
        MatErrorStubComponent,
        InputStubComponent,
        MatCardStubComponent,
        MatLabelStubComponent
      ],
      providers: [
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: ModeratorService,
          useClass: MockModeratorService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService
        }
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
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(RoomJoinComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  beforeEach(() => {
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
