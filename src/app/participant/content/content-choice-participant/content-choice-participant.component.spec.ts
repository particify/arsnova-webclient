import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentChoiceParticipantComponent } from './content-choice-participant.component';
import { Router } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { LanguageService } from '@app/core/services/util/language.service';

describe('ContentChoiceParticipantComponent', () => {
  let component: ContentChoiceParticipantComponent;
  let fixture: ComponentFixture<ContentChoiceParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  const mockContentService = jasmine.createSpyObj(['getCorrectChoiceIndexes']);

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'ensureValidLang',
  ]);
  mockLangService.ensureValidLang.and.returnValue(true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), ContentChoiceParticipantComponent],
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
        {
          provide: LanguageService,
          useValue: mockLangService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentChoiceParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentChoice(
      '1234',
      'subject',
      'body',
      [],
      [],
      [],
      false,
      ContentType.CHOICE
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
