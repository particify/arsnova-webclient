import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentShortAnswerParticipantComponent } from './content-short-answer-participant.component';
import {
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { Router } from '@angular/router';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
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
    component.answerSubmitted = of();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
