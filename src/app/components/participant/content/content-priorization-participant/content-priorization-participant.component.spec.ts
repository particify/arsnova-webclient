import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ContentPriorization } from '@arsnova/app/models/content-priorization';
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
  MockRouter
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ContentPriorizationParticipantComponent } from './content-priorization-participant.component';
import { ContentState } from '@arsnova/app/models/content-state';

describe('ContentPriorizationParticipantComponent', () => {
  let component: ContentPriorizationParticipantComponent;
  let fixture: ComponentFixture<ContentPriorizationParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz'
  }

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentPriorizationParticipantComponent ],
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
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentPriorizationParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentPriorization('1234', '1', '1234', 'subject', 'body', [], [], ContentType.PRIORIZATION, new ContentState(1, new Date(), false), 100);
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
