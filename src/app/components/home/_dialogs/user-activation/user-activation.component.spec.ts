import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserActivationComponent } from './user-activation.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  MockMatDialogRef,
  ActivatedRouteStub,
  MockEventService
} from '@arsnova/testing/test-helpers';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { UserService } from '@arsnova/app/services/http/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

 describe('UserActivationComponent', () => {
  let component: UserActivationComponent;
  let fixture: ComponentFixture<UserActivationComponent>;

  const activatedRouteStub = new ActivatedRouteStub();

  const dialogData = {
    activationKey: '1234'
  };

  const mockUserService = jasmine.createSpyObj(['activate', 'resetActivation']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserActivationComponent ],
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
        { provide: MAT_DIALOG_DATA,
          useValue: dialogData
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub 
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: UserService,
          useValue: mockUserService
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
