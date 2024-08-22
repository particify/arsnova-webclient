import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentShortAnswerParticipantComponent } from './content-short-answer-participant.component';
import {
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { of } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentShortAnswerParticipantComponent', () => {
  let component: ContentShortAnswerParticipantComponent;
  let fixture: ComponentFixture<ContentShortAnswerParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj([
    'addAnswerAndCheckResult',
  ]);

  const snapshot = new ActivatedRouteSnapshot();

  const params = {
    shortId: '12345678',
    seriesName: 'Quiz',
  };

  snapshot.params = of([params]);

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  const mockContentService = jasmine.createSpyObj(ContentService, [
    'getCorrectTerms',
  ]);
  mockContentService.getCorrectTerms.and.returnValue(of(['Test']));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentShortAnswerParticipantComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
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
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentShortAnswerParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentShortAnswer();
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
