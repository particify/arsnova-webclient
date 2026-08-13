import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  BinaryContentFormatData,
  ContentType,
  CreateQuestionnaireBinaryContentGql,
  UpdateQuestionnaireBinaryContentGql,
} from '@gql/generated/graphql';
import { BinaryContentFormComponent } from './binary-content-form.component';

function formatData(
  correctAnswer: boolean | null = null
): BinaryContentFormatData {
  return {
    __typename: 'BinaryContentFormatData',
    format: ContentType.Binary,
    correctAnswer: correctAnswer,
  };
}

describe('BinaryContentFormComponent', () => {
  let fixture: ComponentFixture<BinaryContentFormComponent>;
  let component: BinaryContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireBinaryContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireBinaryContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(initialFormatData: BinaryContentFormatData | null) {
    createContent = jasmine.createSpyObj(
      'CreateQuestionnaireBinaryContentGql',
      ['mutate']
    );
    createContent.mutate.and.returnValue(of({ data: undefined }));
    updateContent = jasmine.createSpyObj(
      'UpdateQuestionnaireBinaryContentGql',
      ['mutate']
    );
    updateContent.mutate.and.returnValue(of({ data: undefined }));
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    configureTestModule(
      [getTranslocoModule(), BinaryContentFormComponent],
      [
        { provide: NotificationService, useValue: notificationService },
        {
          provide: QuestionnairePageService,
          useValue: new QuestionnairePageService(),
        },
        {
          provide: CreateQuestionnaireBinaryContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnaireBinaryContentGql,
          useValue: updateContent,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(BinaryContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  function wantCorrectAnswer() {
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.detectChanges();
  }

  function radioGroup() {
    return fixture.debugElement.query(
      By.css('[data-testid="binary-correct-answer-group"]')
    );
  }

  function createInput(): Record<string, unknown> {
    return (
      createContent.mutate.calls.mostRecent().args[0]?.variables as {
        input: Record<string, unknown>;
      }
    ).input;
  }

  it('picks nothing by default', () => {
    setUp(null);
    expect(component.correctAnswer()).toBeUndefined();
  });

  it('seeds the pick from an existing content', () => {
    setUp(formatData(false));
    expect(component.correctAnswer()).toBeFalse();
  });

  it('keeps a pick the creator just made when the content re-emits', () => {
    setUp(formatData(null));
    component.correctAnswer.set(true);

    fixture.componentRef.setInput('formatData', formatData(null));
    fixture.detectChanges();

    expect(component.correctAnswer()).toBeTrue();
  });

  it('renders nothing while no correct answer is wanted', () => {
    setUp(null);
    expect(radioGroup()).toBeNull();
  });

  it('renders the options once a correct answer is wanted', () => {
    setUp(null);
    wantCorrectAnswer();
    expect(radioGroup()).not.toBeNull();
  });

  it('accepts an empty pick while no correct answer is wanted', () => {
    setUp(null);
    expect(component.formatDataValid()).toBeTrue();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('refuses an empty pick once a correct answer is wanted', () => {
    setUp(null);
    wantCorrectAnswer();

    expect(component.formatDataValid()).toBeFalse();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'creator.content.select-one',
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('does not submit an empty pick', () => {
    setUp(null);
    wantCorrectAnswer();

    component.submit('questionnaire-1', 'Is it true?');

    expect(createContent.mutate).not.toHaveBeenCalled();
  });

  it('creates a content without a correct answer and with the shared inputs', () => {
    setUp(null);
    fixture.componentRef.setInput('duration', 30);
    fixture.componentRef.setInput('weight', 2);
    fixture.componentRef.setInput('abstentionsAllowed', false);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'Is it true?');

    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(createInput()).toEqual({
      questionnaireId: 'questionnaire-1',
      body: 'Is it true?',
      correctAnswer: null,
      duration: 30,
      weight: 2,
      abstentionsAllowed: false,
    });
  });

  it('sends the pick when a correct answer is wanted', () => {
    setUp(null);
    wantCorrectAnswer();
    component.correctAnswer.set(false);

    component.submit('questionnaire-1', 'Is it true?');

    expect(createInput().correctAnswer).toBeFalse();
  });

  it('drops the pick when none is wanted', () => {
    setUp(formatData(true));

    component.submit('questionnaire-1', 'Is it true?');

    expect(createInput().correctAnswer).toBeNull();
  });

  it('updates the content when a content id is set', () => {
    setUp(formatData(true));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    wantCorrectAnswer();

    component.submit('questionnaire-1', 'Is it true?');

    expect(createContent.mutate).not.toHaveBeenCalled();
    const input = (
      updateContent.mutate.calls.mostRecent().args[0]?.variables as {
        input: Record<string, unknown>;
      }
    ).input;
    expect(input).toEqual({
      id: 'content-1',
      body: 'Is it true?',
      correctAnswer: true,
      duration: null,
      weight: undefined,
      abstentionsAllowed: true,
    });
  });
});
