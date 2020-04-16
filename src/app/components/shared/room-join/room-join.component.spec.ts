import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomJoinComponent } from './room-join.component';
import { Injectable, Component, Input } from '@angular/core';
import { TranslateService, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoomService } from '../../../services/http/room.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ModeratorService } from '../../../services/http/moderator.service';
import { EventService } from '../../../services/util/event.service';
import { Observable, of } from 'rxjs';
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';

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
class MockRouter {

}

@Injectable()
class MockNotificationService {

}

@Injectable()
class MockAuthenticationService {
  public watchUser = jasmine.createSpyObj('MockAuthenticationServiceWatchUserSpy', ['subscribe']);
}

@Injectable()
class MockModeratorService {

}

@Injectable()
class MockEventService {

}

@Injectable()
class MockGlobalStorageService {

  getMemoryItem(key: MemoryStorageKey) {
    return undefined;
  }

  getLocalStorageItem(key: LocalStorageKey) {
    return undefined;
  }

  setMemoryItem(key: MemoryStorageKey, value: any) {
  }

  setLocalStorageItem(key: LocalStorageKey, value: any) {
  }

  deleteLocalStorageItem(key: LocalStorageKey) {
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
        InputStubComponent
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
