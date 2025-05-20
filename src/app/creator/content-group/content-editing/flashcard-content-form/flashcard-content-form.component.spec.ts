import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FlashcardContentFormComponent } from './flashcard-content-form.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService } from '@testing/test-helpers';
import { FormattingService } from '@app/core/services/http/formatting.service';

@Injectable()
class MockFormattingService {}

describe('FlashcardContentFormComponent', () => {
  let component: FlashcardContentFormComponent;
  let fixture: ComponentFixture<FlashcardContentFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
      ],
      imports: [getTranslocoModule(), FlashcardContentFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlashcardContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
