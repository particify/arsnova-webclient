import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentTextParticipantComponent } from './content-text-participant.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockLangService,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockEventService
} from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { EventEmitter } from '@angular/core';
import { ContentText } from '@arsnova/app/models/content-text';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { EventService } from '@arsnova/app/services/util/event.service';


describe('ContentTextParticipantComponent', () => {
  let component: ContentTextParticipantComponent;
  let fixture: ComponentFixture<ContentTextParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerText']);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz'
  }

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTextParticipantComponent ],
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
          provide: ContentAnswerService,
          useValue: mockContentAnswerService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: EventService,
          useClass: MockEventService
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTextParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentText('1234', '1', '1234', 'subject', 'body', [], ContentType.TEXT, new ContentState(1, new Date(), false));
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
