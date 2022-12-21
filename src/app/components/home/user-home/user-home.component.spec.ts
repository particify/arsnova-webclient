import { Injectable, Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UserHomeComponent } from './user-home.component';

import { LanguageService } from '../../../services/util/language.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import {
  JsonTranslationLoader,
  MockLangService,
} from '@arsnova/testing/test-helpers';

@Injectable()
class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(null);
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

/* eslint-disable @angular-eslint/component-selector */
@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent {}
/* eslint-enable @angular-eslint/component-selector */

describe('UserHomeComponent', () => {
  let component: UserHomeComponent;
  let fixture: ComponentFixture<UserHomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserHomeComponent,
        RoomJoinStubComponent,
        RoomListStubComponent,
        MatIconStubComponent,
      ],
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
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
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
