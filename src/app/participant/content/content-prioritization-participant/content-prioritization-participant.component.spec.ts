import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentType } from '@app/core/models/content-type.enum';
import {
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { ContentPrioritizationParticipantComponent } from './content-prioritization-participant.component';
import { of } from 'rxjs';

describe('ContentPrioritizationParticipantComponent', () => {
  let component: ContentPrioritizationParticipantComponent;
  let fixture: ComponentFixture<ContentPrioritizationParticipantComponent>;

  const mockContentAnswerService = jasmine.createSpyObj(['addAnswerChoice']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        ContentPrioritizationParticipantComponent,
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ContentPrioritizationParticipantComponent
    );
    component = fixture.componentInstance;
    component.content = new ContentPrioritization(
      '1234',
      'subject',
      'body',
      [],
      [],
      ContentType.PRIORITIZATION,
      100
    );
    component.answerSubmitted = of();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
