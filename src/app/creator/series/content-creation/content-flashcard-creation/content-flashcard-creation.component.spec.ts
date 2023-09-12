import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentFlashcardCreationComponent } from './content-flashcard-creation.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService } from '@testing/test-helpers';
import { FormattingService } from '@app/core/services/http/formatting.service';

@Injectable()
class MockFormattingService {}

describe('ContentFlashcardCreationComponent', () => {
  let component: ContentFlashcardCreationComponent;
  let fixture: ComponentFixture<ContentFlashcardCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentFlashcardCreationComponent],
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
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentFlashcardCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
