import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentScaleParticipantComponent } from './content-scale-participant.component';
import { Router } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  MockGlobalStorageService,
  MockRouter,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { LanguageService } from '@app/core/services/util/language.service';
import { of } from 'rxjs';

describe('ContentScaleParticipantComponent', () => {
  let component: ContentScaleParticipantComponent;
  let fixture: ComponentFixture<ContentScaleParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  const mockContentService = jasmine.createSpyObj(['getCorrectChoiceIndexes']);

  const mockLikertScaleService = jasmine.createSpyObj(['getOptionLabels']);
  mockLikertScaleService.getOptionLabels.and.returnValue([]);

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'ensureValidLang',
  ]);
  mockLangService.ensureValidLang.and.returnValue(true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), ContentScaleParticipantComponent],
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
          provide: LikertScaleService,
          useValue: mockLikertScaleService,
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
    fixture = TestBed.createComponent(ContentScaleParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentScale(LikertScaleTemplate.AGREEMENT, 5);
    component.answerSubmitted = of();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
