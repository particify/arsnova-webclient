import { failedOperation } from '@testing/graphql-fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentPrioritizationAnswerComponent } from '@app/standalone/content-answers/content-prioritization-answer/content-prioritization-answer.component';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnairePrioritizationAnswerGql,
  PrioritizationContentFormatData,
} from '@gql/generated/graphql';
import { ContentPrioritizationParticipantComponent } from './content-prioritization-participant.component';

const ASSIGNABLE_POINTS = 60;

function contentFormatData(
  labels = ['A', 'B', 'C']
): PrioritizationContentFormatData {
  return {
    __typename: 'PrioritizationContentFormatData',
    format: ContentType.Prioritization,
    assignablePoints: ASSIGNABLE_POINTS,
    options: labels.map((label) => ({
      __typename: 'AnswerOption' as const,
      label,
      labelRendered: null,
    })),
  };
}

describe('ContentPrioritizationParticipantComponent', () => {
  let fixture: ComponentFixture<ContentPrioritizationParticipantComponent>;
  let component: ContentPrioritizationParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnairePrioritizationAnswerGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp() {
    createAnswer = jasmine.createSpyObj(
      'CreateQuestionnairePrioritizationAnswerGql',
      ['mutate']
    );
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnairePrioritizationAnswer: {
            __typename: 'Answer',
            id: 'answer-1',
            result: AnswerResultState.Neutral,
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

    configureTestModule(
      [getTranslocoModule(), ContentPrioritizationParticipantComponent],
      [
        {
          provide: CreateQuestionnairePrioritizationAnswerGql,
          useValue: createAnswer,
        },
        { provide: NotificationService, useValue: notificationService },
        {
          provide: FormattingService,
          useValue: { postString: () => of({ html: '' }) },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(
      ContentPrioritizationParticipantComponent
    );
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('contentFormatData', contentFormatData());
    fixture.detectChanges();
  }

  function list(): ContentPrioritizationAnswerComponent {
    return fixture.debugElement.query(
      By.directive(ContentPrioritizationAnswerComponent)
    ).componentInstance;
  }

  function assign(assignedPoints: number[]) {
    component.assignedPoints.set(assignedPoints);
    fixture.detectChanges();
  }

  function answerGiven(assignedPoints: number[]) {
    fixture.componentRef.setInput('answerFormatData', {
      __typename: 'PrioritizationAnswerFormatData',
      format: ContentType.Prioritization,
      assignedPoints,
    });
    fixture.componentRef.setInput('result', AnswerResultState.Neutral);
    fixture.detectChanges();
  }

  function submittedPoints(): number[] {
    return (
      createAnswer.mutate.calls.mostRecent().args[0]?.variables as {
        assignedPoints: number[];
      }
    ).assignedPoints;
  }

  function warning(): string {
    return notificationService.showAdvanced.calls.mostRecent()
      .args[0] as string;
  }

  it('starts every item at no points', () => {
    setUp();
    expect(component.assignedPoints()).toEqual([0, 0, 0]);
    expect(
      list()
        .answerOptions()
        .map((option) => option.label)
    ).toEqual(['A', 'B', 'C']);
    expect(list().assignablePoints()).toBe(ASSIGNABLE_POINTS);
  });

  it('leaves the points assignable until an answer is given', () => {
    setUp();
    expect(list().disabled()).toBe(false);
    answerGiven([30, 20, 10]);
    expect(list().disabled()).toBe(true);
  });

  it('locks the points while answering is locked', () => {
    setUp();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(list().disabled()).toBe(true);
  });

  it('shows the points a revisited answer assigned', () => {
    setUp();
    answerGiven([30, 20, 10]);
    expect(component.assignedPoints()).toEqual([30, 20, 10]);
    expect(list().assignedPoints()).toEqual([30, 20, 10]);
  });

  it('keeps the points being distributed when the content re-emits', () => {
    setUp();
    assign([20, 20, 20]);

    // Apollo hands out a fresh object on every cache update.
    fixture.componentRef.setInput('contentFormatData', contentFormatData());
    fixture.detectChanges();

    expect(component.assignedPoints()).toEqual([20, 20, 20]);
  });

  it('refuses a total below the budget', () => {
    setUp();
    assign([20, 20, 10]);
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(warning()).toBe('participant.answer.please-assign-points-correctly');
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('refuses a total above the budget', () => {
    setUp();
    assign([30, 30, 30]);
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(warning()).toBe('participant.answer.please-assign-points-correctly');
  });

  it('refuses an entry outside the budget even when the total fits', () => {
    setUp();
    assign([ASSIGNABLE_POINTS + 10, -10, 0]);
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(warning()).toBe('participant.answer.please-assign-valid-points');
  });

  it('submits the points once they add up to the budget', () => {
    setUp();
    assign([30, 20, 10]);
    component.submitAnswer();
    expect(submittedPoints()).toEqual([30, 20, 10]);
    expect(warning()).toBe('participant.answer.sent');
  });

  it('reports the created answer to the surrounding page', () => {
    setUp();
    const created: string[] = [];
    component.answerCreated.subscribe((answer) => created.push(answer.id));
    assign([ASSIGNABLE_POINTS, 0, 0]);
    component.submitAnswer();
    expect(created).toEqual(['answer-1']);
  });

  it('reports a failed answer and emits nothing', () => {
    setUp();
    createAnswer.mutate.and.returnValue(failedOperation() as never);
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    assign([ASSIGNABLE_POINTS, 0, 0]);
    component.submitAnswer();
    expect(emitted).toEqual([]);
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('submits nothing while no round is running', () => {
    setUp();
    fixture.componentRef.setInput('roundId', undefined);
    fixture.detectChanges();
    assign([30, 20, 10]);
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });
});
