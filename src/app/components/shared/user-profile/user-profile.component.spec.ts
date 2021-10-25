import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileComponent } from './user-profile.component';
import { Router } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { JsonTranslationLoader, MockEventService, MockGlobalStorageService } from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { Observable, of } from 'rxjs';
import { UserService } from '@arsnova/app/services/http/user.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { User } from '@arsnova/app/models/user';
import { Person } from '@arsnova/app/models/person';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

export class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new ClientAuthentication('1', 'a@b.cd', AuthProvider.ARSNOVA, 'token'));
  }
}

export class MockUserService {
  getUserByLoginId(loginId: string): Observable<User[]> {
    return of([new User('1', 'a@b.cd', AuthProvider.ARSNOVA, 'revision', new Person())]);
  }
}

@Pipe({name: 'a11yIntro'})
class MockA11yIntroPipe implements PipeTransform {
  transform(i18nKey: string, args?: object): Observable<string> {
    return of(i18nKey);
  }
}

class MockDialogService {
}

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let notificationService = jasmine.createSpyObj('NotificationService', ['showAdvanced']);
  let router = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UserProfileComponent,
        MockA11yIntroPipe
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
          useValue: router
        },
        {
          provide: NotificationService,
          useValue: notificationService
        },
        {
          provide: UserService,
          useClass: MockUserService
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
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: DialogService,
          useClass: MockDialogService
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
