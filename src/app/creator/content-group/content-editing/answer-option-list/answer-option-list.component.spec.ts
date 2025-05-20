import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerOptionListComponent } from './answer-option-list.component';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockAnnounceService,
  MockNotificationService,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnswerOptionListComponent', () => {
  let component: AnswerOptionListComponent;
  let fixture: ComponentFixture<AnswerOptionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), AnswerOptionListComponent],
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
    });
    fixture = TestBed.createComponent(AnswerOptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
