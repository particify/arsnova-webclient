import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentSortParticipantComponent } from './content-sort-participant.component';
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
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';

describe('ContentSortParticipantComponent', () => {
  let component: ContentSortParticipantComponent;
  let fixture: ComponentFixture<ContentSortParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj([
    'addAnswerChoice',
    'shuffleAnswerOptions',
  ]);

  const mockContentService = jasmine.createSpyObj(['getCorrectChoiceIndexes']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), ContentSortParticipantComponent],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSortParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentChoice(
      '1234',
      'subject',
      'body',
      [],
      [],
      [],
      false,
      ContentType.SORT
    );
    component.sendEvent = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
