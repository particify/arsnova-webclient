import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccessComponent } from './access.component';
import {
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockLangService,
  MockNotificationService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '@arsnova/app/services/util/event.service';
import { Room } from '@arsnova/app/models/room';
import { ModeratorService } from '@arsnova/app/services/http/moderator.service';
import { UserService } from '@arsnova/app/services/http/user.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { of } from 'rxjs';
import { Moderator } from '@arsnova/app/models/moderator';
import { UserRole } from '@arsnova/app/models/user-roles.enum';
import { User } from '@arsnova/app/models/user';
import { Person } from '@arsnova/app/models/person';
import { AccessTokenService } from '@arsnova/app/services/http/access-token.service';

@Injectable()
class MockRoomService {
}

@Injectable()
class MockModeratorService {
  get() {
    return of([new Moderator('12345', 'b@a.cd', UserRole.EXECUTIVE_MODERATOR)])
  }
}

@Injectable()
class MockDialogService {
}

@Injectable()
class MockLiveAnnouncer {
}

@Injectable()
class MockUserService {
  getUserData() {
    return of([new User('12345', 'b@a.cd', AuthProvider.ARSNOVA, '0', new Person())]);
  }
}

@Injectable()
class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token'));
  }
  isLoginIdEmailAddress() {
    return of(true);
  }
}

@Injectable()
class MockAccessTokenService {
  invite() {
  }
}

describe('AccessComponent', () => {
  let component: AccessComponent;
  let fixture: ComponentFixture<AccessComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessComponent ],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ModeratorService,
          useClass: MockModeratorService
        },
        {
          provide: DialogService,
          useClass: MockDialogService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: LiveAnnouncer,
          useClass: MockLiveAnnouncer
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: AccessTokenService,
          useClass: MockAccessTokenService
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
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room('1234', 'shortId', 'abbreviation', 'name', 'description');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
})
