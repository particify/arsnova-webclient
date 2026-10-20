import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireShortAnswerAnswerGql,
  ShortAnswerContentFormatData,
} from '@gql/generated/graphql';
import { ContentShortAnswerParticipantComponent } from './content-short-answer-participant.component';

const contentFormatData: ShortAnswerContentFormatData = {
  __typename: 'ShortAnswerContentFormatData',
  format: ContentType.ShortAnswer,
  correctTerms: ['Kotlin', 'Java'],
};

describe('ContentShortAnswerParticipantComponent', () => {
  let fixture: ComponentFixture<ContentShortAnswerParticipantComponent>;
  let component: ContentShortAnswerParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnaireShortAnswerAnswerGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    createAnswer = jasmine.createSpyObj(
      'CreateQuestionnaireShortAnswerAnswerGql',
      ['mutate']
    );
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireShortAnswerAnswer: {
            __typename: 'Answer',
            id: 'answer-1',
            result: AnswerResultState.Correct,
            hidden: false,
            createdAt: null,
            durationMs: null,
            formatData: null,
          },
        },
      })
    );
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    const testBed = configureTestModule(
      [getTranslocoModule(), ContentShortAnswerParticipantComponent],
      [
        {
          provide: CreateQuestionnaireShortAnswerAnswerGql,
          useValue: createAnswer,
        },
        { provide: NotificationService, useValue: notificationService },
      ]
    );
    await testBed.compileComponents();

    fixture = TestBed.createComponent(ContentShortAnswerParticipantComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('contentFormatData', contentFormatData);
    fixture.detectChanges();
  });

  function answerField(): ContentTextAnswerComponent {
    return fixture.debugElement.query(By.directive(ContentTextAnswerComponent))
      .componentInstance;
  }

  function termsHint(): HTMLElement | undefined {
    return fixture.debugElement.query(
      By.css('[data-testid="short-answer-correct-terms"]')
    )?.nativeElement;
  }

  function answerGiven(body: string, result: AnswerResultState) {
    fixture.componentRef.setInput('answerFormatData', {
      __typename: 'ShortAnswerAnswerFormatData',
      format: ContentType.ShortAnswer,
      body,
    });
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
  }

  it('limits the answer to 80 characters on a single line', () => {
    expect(answerField().lengthLimit()).toBe(80);
    expect(answerField().minRows()).toBe(1);
  });

  it('does not submit an empty answer', () => {
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('does not submit a whitespace-only answer', () => {
    component.answer.set('   ');
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
  });

  it('submits the trimmed answer for the active round', () => {
    component.answer.set('  Kotlin  ');
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', body: 'Kotlin' },
    });
  });

  it('emits the created answer', () => {
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    component.answer.set('Kotlin');
    component.submitAnswer();
    expect(emitted).toEqual(['answer-1']);
  });

  it('seeds the answer from an already given answer', () => {
    answerGiven('Kotlin', AnswerResultState.Correct);
    expect(component.answer()).toBe('Kotlin');
    expect(answerField().disabled()).toBe(true);
  });

  it('leaves the field neutral while nothing has been answered', () => {
    expect(component.correct()).toBeUndefined();
    expect(answerField().correct()).toBeUndefined();
    expect(termsHint()).toBeUndefined();
  });

  it('leaves the field neutral while the correct answers are unpublished', () => {
    answerGiven('Kotlin', AnswerResultState.Correct);
    expect(component.correct()).toBeUndefined();
    expect(termsHint()).toBeUndefined();
  });

  it('marks a correct answer as correct once published', () => {
    answerGiven('Kotlin', AnswerResultState.Correct);
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.detectChanges();
    expect(component.correct()).toBe(true);
    expect(
      fixture.debugElement.query(By.css('[data-testid="text-answer-correct"]'))
    ).not.toBeNull();
  });

  it('marks a wrong answer as wrong once published', () => {
    answerGiven('Scala', AnswerResultState.Wrong);
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.detectChanges();
    expect(component.correct()).toBe(false);
    expect(
      fixture.debugElement.query(By.css('[data-testid="text-answer-wrong"]'))
    ).not.toBeNull();
  });

  it('lists the correct terms once published', () => {
    answerGiven('Scala', AnswerResultState.Wrong);
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.detectChanges();
    expect(component.correctTerms()).toEqual(['Kotlin', 'Java']);
    expect(termsHint()?.textContent).toContain('Kotlin, Java');
  });

  it('lists a single correct term too', () => {
    fixture.componentRef.setInput('contentFormatData', {
      ...contentFormatData,
      correctTerms: ['Kotlin'],
    });
    answerGiven('Kotlin', AnswerResultState.Correct);
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.detectChanges();
    expect(termsHint()?.textContent).toContain('Kotlin');
  });
});
