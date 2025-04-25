import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentNumericParticipantComponent } from './content-numeric-participant.component';
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
import { ContentType } from '@app/core/models/content-type.enum';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentNumericParticipantComponent', () => {
  let component: ContentNumericParticipantComponent;
  let fixture: ComponentFixture<ContentNumericParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  const mockContentService = jasmine.createSpyObj(['getCorrectChoiceIndexes']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        ContentNumericParticipantComponent,
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentNumericParticipantComponent);
    component = fixture.componentInstance;
    component.content = new ContentNumeric(
      '1234',
      'subject',
      ContentType.NUMERIC
    );
    component.answerSubmitted = new EventEmitter<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
