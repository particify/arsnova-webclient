import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { NotificationService } from '@app/core/services/util/notification.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  ContentType,
  CreateQuestionnaireFlashcardContentGql,
  FlashcardContentFormatData,
  UpdateQuestionnaireFlashcardContentGql,
} from '@gql/generated/graphql';
import { FlashcardContentFormComponent } from './flashcard-content-form.component';

function formatData(answer: string): FlashcardContentFormatData {
  return {
    __typename: 'FlashcardContentFormatData',
    format: ContentType.Flashcard,
    answer,
  };
}

describe('FlashcardContentFormComponent', () => {
  let fixture: ComponentFixture<FlashcardContentFormComponent>;
  let component: FlashcardContentFormComponent;

  function setUp(initialFormatData: FlashcardContentFormatData | null) {
    configureTestModule(
      [getTranslocoModule(), FlashcardContentFormComponent],
      [
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
        {
          provide: QuestionnairePageService,
          useValue: new QuestionnairePageService(),
        },
        {
          provide: CreateQuestionnaireFlashcardContentGql,
          useValue: jasmine.createSpyObj(
            'CreateQuestionnaireFlashcardContentGql',
            ['mutate']
          ),
        },
        {
          provide: UpdateQuestionnaireFlashcardContentGql,
          useValue: jasmine.createSpyObj(
            'UpdateQuestionnaireFlashcardContentGql',
            ['mutate']
          ),
        },
        {
          provide: FormattingService,
          useValue: jasmine.createSpyObj('FormattingService', [
            'containsTextAnImage',
          ]),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(FlashcardContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  it('seeds the answer from existing format data', () => {
    setUp(formatData('The answer'));
    expect(component.answer()).toBe('The answer');
  });

  it('seeds an empty answer when there is no existing format data', () => {
    setUp(null);
    expect(component.answer()).toBe('');
  });

  it('is invalid when the answer is blank', () => {
    setUp(null);
    component.answer.set('');
    expect(component.formatDataValid()).toBe(false);
  });

  it('is invalid when the answer is whitespace-only', () => {
    setUp(null);
    component.answer.set('   ');
    expect(component.formatDataValid()).toBe(false);
  });

  it('is valid when the answer is filled', () => {
    setUp(null);
    component.answer.set('The answer');
    expect(component.formatDataValid()).toBe(true);
  });
});
