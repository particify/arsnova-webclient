import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { EventService } from '@arsnova/app/services/util/event.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import {
  ActivatedRouteStub,
  MockEventService,
  MockNotificationService,
  MockRouter,
  JsonTranslationLoader
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { UserService } from '@arsnova/app/services/http/user.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const mockUserService = jasmine.createSpyObj(['register']);

  const data = {
    apiConfig: {
      ui: {
        links: {
          tos: {
            url: 'tos'
          }
        }
      }
    }
  };

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = data;

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
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
          provide: UserService,
          useValue: mockUserService
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
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        }
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
