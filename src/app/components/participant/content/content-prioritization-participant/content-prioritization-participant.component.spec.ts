import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { ContentPrioritization } from '@arsnova/app/models/content-prioritization';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockGlobalStorageService,
  MockLangService,
  MockNotificationService,
  MockRouter,
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ContentPrioritizationParticipantComponent } from './content-prioritization-participant.component';
import { ContentState } from '@arsnova/app/models/content-state';

describe('ContentPrioritizationParticipantComponent', () => {
  let component: ContentPrioritizationParticipantComponent;
  let fixture: ComponentFixture<ContentPrioritizationParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentPrioritizationParticipantComponent],
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
          provide: ContentAnswerService,
          useValue: mockContentAnswerService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ContentPrioritizationParticipantComponent
    );
    component = fixture.componentInstance;
    component.content = new ContentPrioritization(
      '1234',
      '1',
      '1234',
      'subject',
      'body',
      [],
      [],
      ContentType.PRIORITIZATION,
      new ContentState(1, new Date(), false),
      100
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
