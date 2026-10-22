import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireNumericAnswerGql,
  NumericContentFormatData,
} from '@gql/generated/graphql';
import { ContentNumericParticipantComponent } from './content-numeric-participant.component';

const contentFormatData: NumericContentFormatData = {
  __typename: 'NumericContentFormatData',
  format: ContentType.Numeric,
  minNumber: 1,
  maxNumber: 100,
  correctNumber: 42,
  tolerance: 2,
};

describe('ContentNumericParticipantComponent', () => {
  let fixture: ComponentFixture<ContentNumericParticipantComponent>;
  let component: ContentNumericParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnaireNumericAnswerGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    createAnswer = jasmine.createSpyObj('CreateQuestionnaireNumericAnswerGql', [
      'mutate',
    ]);
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireNumericAnswer: {
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
      [getTranslocoModule(), ContentNumericParticipantComponent],
      [
        {
          provide: CreateQuestionnaireNumericAnswerGql,
          useValue: createAnswer,
        },
        { provide: NotificationService, useValue: notificationService },
      ]
    );
    await testBed.compileComponents();

    fixture = TestBed.createComponent(ContentNumericParticipantComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('contentFormatData', contentFormatData);
    fixture.detectChanges();
  });

  function expectWarned() {
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  }

  it('does not submit without a number', () => {
    component.submitAnswer();
    expectWarned();
  });

  it('does not submit a number below the minimum', () => {
    component.selectedNumber.set(0);
    component.submitAnswer();
    expectWarned();
  });

  it('does not submit a number above the maximum', () => {
    component.selectedNumber.set(101);
    component.submitAnswer();
    expectWarned();
  });

  it('submits a number on the lower bound of the range', () => {
    component.selectedNumber.set(1);
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', selectedNumber: 1 },
    });
  });

  it('submits a number on the upper bound of the range', () => {
    component.selectedNumber.set(100);
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', selectedNumber: 100 },
    });
  });

  it('submits a decimal number', () => {
    component.selectedNumber.set(41.5);
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', selectedNumber: 41.5 },
    });
  });

  it('emits the created answer', () => {
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    component.selectedNumber.set(42);
    component.submitAnswer();
    expect(emitted).toEqual(['answer-1']);
  });

  it('does nothing while there is no active round', () => {
    fixture.componentRef.setInput('roundId', undefined);
    fixture.detectChanges();
    component.selectedNumber.set(42);
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('seeds the number from an already given answer', () => {
    fixture.componentRef.setInput('answerFormatData', {
      __typename: 'NumericAnswerFormatData',
      format: ContentType.Numeric,
      selectedNumber: 17,
    });
    fixture.detectChanges();
    expect(component.selectedNumber()).toBe(17);
    expect(component.answered()).toBe(true);
  });
});
