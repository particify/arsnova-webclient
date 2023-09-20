import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { CreateAnswerOptionComponent } from './create-answer-option.component';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockAnnounceService,
  MockNotificationService,
} from '@testing/test-helpers';
import { AnnounceService } from '@app/core/services/util/announce.service';

describe('CreateAnswerOptionComponent', () => {
  let component: CreateAnswerOptionComponent;
  let fixture: ComponentFixture<CreateAnswerOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAnswerOptionComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAnswerOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
