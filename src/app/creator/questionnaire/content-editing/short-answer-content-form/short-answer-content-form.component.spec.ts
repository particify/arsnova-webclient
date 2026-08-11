import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { AnswerOptionListComponent } from '@app/creator/questionnaire/content-editing/answer-option-list/answer-option-list.component';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireShortAnswerContentGql,
  ShortAnswerContentFormatData,
  UpdateQuestionnaireShortAnswerContentGql,
} from '@gql/generated/graphql';
import { ShortAnswerContentFormComponent } from './short-answer-content-form.component';

function formatData(correctTerms: string[]): ShortAnswerContentFormatData {
  return {
    __typename: 'ShortAnswerContentFormatData',
    format: ContentType.ShortAnswer,
    correctTerms,
  };
}

describe('ShortAnswerContentFormComponent', () => {
  let fixture: ComponentFixture<ShortAnswerContentFormComponent>;
  let component: ShortAnswerContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireShortAnswerContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireShortAnswerContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(initialFormatData: ShortAnswerContentFormatData | null) {
    createContent = jasmine.createSpyObj(
      'CreateQuestionnaireShortAnswerContentGql',
      ['mutate']
    );
    createContent.mutate.and.returnValue(of({ data: undefined }));
    updateContent = jasmine.createSpyObj(
      'UpdateQuestionnaireShortAnswerContentGql',
      ['mutate']
    );
    updateContent.mutate.and.returnValue(of({ data: undefined }));
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    configureTestModule(
      [getTranslocoModule(), ShortAnswerContentFormComponent],
      [
        { provide: NotificationService, useValue: notificationService },
        {
          provide: QuestionnairePageService,
          useValue: new QuestionnairePageService(),
        },
        {
          provide: CreateQuestionnaireShortAnswerContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnaireShortAnswerContentGql,
          useValue: updateContent,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ShortAnswerContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  function answerList(): AnswerOptionListComponent | undefined {
    return fixture.debugElement.query(By.directive(AnswerOptionListComponent))
      ?.componentInstance;
  }

  function input(): Record<string, unknown> {
    const mutate = createContent.mutate.calls.any()
      ? createContent.mutate
      : updateContent.mutate;
    return (
      mutate.calls.mostRecent().args[0]?.variables as {
        input: Record<string, unknown>;
      }
    ).input;
  }

  function setTerms(terms: string[]) {
    component.displayAnswers.update((answers) =>
      answers.map((answer, i) => ({ ...answer, option: terms[i] ?? '' }))
    );
    fixture.detectChanges();
  }

  it('offers one empty term on a new content', () => {
    setUp(null);
    expect(answerList()?.answers().length).toBe(1);
    expect(answerList()?.answers()[0].option).toBe('');
  });

  it('seeds the terms from an existing content', () => {
    setUp(formatData(['Kotlin', 'Java']));
    expect(component.displayAnswers().map((a) => a.option)).toEqual([
      'Kotlin',
      'Java',
    ]);
  });

  it('keeps just-edited terms when the content re-emits unchanged', () => {
    setUp(formatData(['Kotlin', 'Java']));
    fixture.componentRef.setInput('contentId', 'content-1');
    setTerms(['Scala', 'Java']);

    // Apollo hands out a fresh object on every cache update, e.g. when an
    // answer count arrives, so the terms are compared by value.
    fixture.componentRef.setInput('formatData', formatData(['Kotlin', 'Java']));
    fixture.detectChanges();

    expect(component.displayAnswers().map((a) => a.option)).toEqual([
      'Scala',
      'Java',
    ]);
  });

  it('re-seeds the terms when the persisted ones themselves change', () => {
    setUp(formatData(['Kotlin', 'Java']));
    fixture.componentRef.setInput('contentId', 'content-1');
    setTerms(['Scala', 'Java']);

    fixture.componentRef.setInput('formatData', formatData(['Groovy']));
    fixture.detectChanges();

    expect(component.displayAnswers().map((a) => a.option)).toEqual(['Groovy']);
  });

  it('limits a term to 80 characters', () => {
    setUp(null);
    expect(answerList()?.lengthLimit).toBe(80);
  });

  it('keeps a single term deletable while nothing has been answered', () => {
    setUp(formatData(['Kotlin']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.detectChanges();
    expect(component.locked()).toBe(false);
    expect(answerList()?.allowDeletion).toBe(true);
    expect(answerList()?.disabled).toBe(false);
  });

  it('locks the terms once the content has been answered', () => {
    setUp(formatData(['Kotlin']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('answered', true);
    fixture.detectChanges();
    expect(component.locked()).toBe(true);
    expect(answerList()?.allowDeletion).toBe(false);
    expect(answerList()?.disabled).toBe(true);
  });

  it('leaves a new content unlocked even while a sibling is answered', () => {
    setUp(null);
    fixture.componentRef.setInput('answered', true);
    fixture.detectChanges();
    expect(component.locked()).toBe(false);
  });

  it('rejects an empty term', () => {
    setUp(null);
    expect(component.formatDataValid()).toBe(false);
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('rejects duplicate terms', () => {
    setUp(formatData(['Kotlin', 'Kotlin']));
    expect(component.formatDataValid()).toBe(false);
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('accepts a single non-empty term', () => {
    setUp(formatData(['Kotlin']));
    expect(component.formatDataValid()).toBe(true);
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('stays valid in the preview, where the list is not rendered', () => {
    setUp(formatData(['Kotlin']));
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    expect(answerList()).toBeUndefined();
    expect(component.formatDataValid()).toBe(true);
  });

  it('does not submit an invalid term list', () => {
    setUp(null);
    component.submit('questionnaire-1', 'Which language?');
    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(updateContent.mutate).not.toHaveBeenCalled();
  });

  it('creates a content with the terms and the shared inputs', () => {
    setUp(null);
    fixture.componentRef.setInput('duration', 30);
    fixture.componentRef.setInput('weight', 2);
    fixture.componentRef.setInput('abstentionsAllowed', false);
    setTerms(['Kotlin']);

    component.submit('questionnaire-1', 'Which language?');

    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(input()).toEqual({
      questionnaireId: 'questionnaire-1',
      body: 'Which language?',
      correctTerms: ['Kotlin'],
      duration: 30,
      weight: 2,
      abstentionsAllowed: false,
    });
  });

  it('updates the content when a content id is set', () => {
    setUp(formatData(['Kotlin', 'Java']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'Which language?');

    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(input()).toEqual({
      id: 'content-1',
      body: 'Which language?',
      correctTerms: ['Kotlin', 'Java'],
      duration: null,
      weight: undefined,
      abstentionsAllowed: true,
    });
  });
});
