import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentPageComponent } from './comment-page.component';
import { Renderer2, Component, Input, Pipe, PipeTransform, NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { CommentService } from '../../../services/http/comment.service';
import { HotkeyService } from '../../../services/util/hotkey.service';
import { ActivatedRouteStub,
  JsonTranslationLoader,
  MockGlobalStorageService,
  MockNotificationService,
  MockEventService,
  MockAnnounceService,
  MockRenderer2
} from '@arsnova/testing/test-helpers';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';

@Component({ selector: 'app-comment-list', template: '' })
class CommentListStubComponent {
  @Input() auth: ClientAuthentication;
  @Input() roomId: string;
}

describe('CommentPageComponent', () => {
  let component: CommentPageComponent;
  let fixture: ComponentFixture<CommentPageComponent>;

  const data = {
    isModeration: false
  }
  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = data;
  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  const mockCommentService = jasmine.createSpyObj(['lowlight'])

  const mockAuthenticationService = jasmine.createSpyObj(['getCurrentAuthentication']);
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of({}));

  const mockHotkeyService = jasmine.createSpyObj(['registerHotkey']);

  let translateService: TranslateService;
  const mockA11yIntroPipe = new A11yIntroPipe(translateService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CommentPageComponent,
        CommentListStubComponent,
        A11yIntroPipe
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
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: CommentService,
          useValue: mockCommentService
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
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
          provide: AnnounceService,
          useClass: MockAnnounceService
        },
        {
          provide: Renderer2,
          useClass: MockRenderer2
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService
        },
        {
          provide: A11yIntroPipe,
          useValue: mockA11yIntroPipe
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CommentPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
