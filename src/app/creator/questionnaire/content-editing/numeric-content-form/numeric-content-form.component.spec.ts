import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireNumericContentGql,
  NumericContentFormatData,
  UpdateQuestionnaireNumericContentGql,
} from '@gql/generated/graphql';
import { NumericContentFormComponent } from './numeric-content-form.component';

const MAX_VALUE = 1_000_000_000_000_000;

function formatData(
  overrides: Partial<NumericContentFormatData> = {}
): NumericContentFormatData {
  return {
    __typename: 'NumericContentFormatData',
    format: ContentType.Numeric,
    minNumber: 1,
    maxNumber: 100,
    correctNumber: null,
    tolerance: 0,
    ...overrides,
  };
}

describe('NumericContentFormComponent', () => {
  let fixture: ComponentFixture<NumericContentFormComponent>;
  let component: NumericContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireNumericContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireNumericContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(initialFormatData: NumericContentFormatData | null) {
    createContent = jasmine.createSpyObj(
      'CreateQuestionnaireNumericContentGql',
      ['mutate']
    );
    createContent.mutate.and.returnValue(of({ data: undefined }));
    updateContent = jasmine.createSpyObj(
      'UpdateQuestionnaireNumericContentGql',
      ['mutate']
    );
    updateContent.mutate.and.returnValue(of({ data: undefined }));
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    configureTestModule(
      [getTranslocoModule(), NumericContentFormComponent],
      [
        { provide: NotificationService, useValue: notificationService },
        {
          provide: QuestionnairePageService,
          useValue: new QuestionnairePageService(),
        },
        {
          provide: CreateQuestionnaireNumericContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnaireNumericContentGql,
          useValue: updateContent,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(NumericContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  function createInput(): Record<string, unknown> {
    return (
      createContent.mutate.calls.mostRecent().args[0]?.variables as {
        input: Record<string, unknown>;
      }
    ).input;
  }

  function expectRejected() {
    expect(component.formatDataValid()).toBe(false);
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  }

  it('defaults to a range from 1 to 100 without a tolerance', () => {
    setUp(null);
    expect(component.minimum()).toBe(1);
    expect(component.maximum()).toBe(100);
    expect(component.correctNumber()).toBeUndefined();
    expect(component.tolerance()).toBeUndefined();
  });

  it('seeds the fields from an existing content', () => {
    setUp(
      formatData({
        minNumber: -5,
        maxNumber: 5,
        correctNumber: 2,
        tolerance: 0.5,
      })
    );
    expect(component.minimum()).toBe(-5);
    expect(component.maximum()).toBe(5);
    expect(component.correctNumber()).toBe(2);
    expect(component.tolerance()).toBe(0.5);
  });

  it('accepts a range without a correct answer', () => {
    setUp(null);
    expect(component.formatDataValid()).toBe(true);
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('rejects a minimum that is not below the maximum', () => {
    setUp(null);
    component.maximum.set(1);
    expectRejected();
  });

  it('rejects a minimum beyond the value limit', () => {
    setUp(null);
    component.minimum.set(-MAX_VALUE - 1);
    expectRejected();
  });

  it('rejects a maximum beyond the value limit', () => {
    setUp(null);
    component.maximum.set(MAX_VALUE + 1);
    expectRejected();
  });

  it('rejects a range wider than the value limit', () => {
    setUp(null);
    component.minimum.set(-MAX_VALUE);
    component.maximum.set(MAX_VALUE);
    expectRejected();
  });

  it('rejects an emptied minimum or maximum', () => {
    setUp(null);
    component.minimum.set(null as never);
    expectRejected();
  });

  it('rejects a negative tolerance', () => {
    setUp(null);
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.detectChanges();
    component.correctNumber.set(50);
    component.tolerance.set(-1);
    expectRejected();
  });

  it('requires a correct answer once it has been cleared', () => {
    setUp(null);
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.detectChanges();
    component.correctNumber.set(null as never);
    expectRejected();
  });

  it('requires a correct answer once one is asked for', () => {
    setUp(null);
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.detectChanges();
    expectRejected();
  });

  it('rejects a correct answer whose tolerance leaves the range', () => {
    setUp(null);
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.detectChanges();
    component.correctNumber.set(99);
    component.tolerance.set(2);
    expectRejected();
  });

  it('accepts a correct answer whose tolerance ends exactly on the bounds', () => {
    setUp(null);
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.detectChanges();
    component.correctNumber.set(99);
    component.tolerance.set(1);
    expect(component.formatDataValid()).toBe(true);
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('creates a content with the range and the shared inputs', () => {
    setUp(null);
    fixture.componentRef.setInput('duration', 30);
    fixture.componentRef.setInput('weight', 2);
    fixture.componentRef.setInput('abstentionsAllowed', false);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'How many?');

    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(createInput()).toEqual({
      questionnaireId: 'questionnaire-1',
      body: 'How many?',
      minNumber: 1,
      maxNumber: 100,
      correctNumber: null,
      tolerance: null,
      duration: 30,
      weight: 2,
      abstentionsAllowed: false,
    });
  });

  it('sends the correct number and tolerance when one is asked for', () => {
    setUp(null);
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.detectChanges();
    component.correctNumber.set(42);
    component.tolerance.set(2);

    component.submit('questionnaire-1', 'How many?');

    expect(createInput().correctNumber).toBe(42);
    expect(createInput().tolerance).toBe(2);
  });

  it('drops the correct number when none is asked for', () => {
    setUp(formatData({ correctNumber: 42, tolerance: 2 }));

    component.submit('questionnaire-1', 'How many?');

    expect(createInput().correctNumber).toBeNull();
    expect(createInput().tolerance).toBeNull();
  });

  it('does not submit an invalid range', () => {
    setUp(null);
    component.maximum.set(0);

    component.submit('questionnaire-1', 'How many?');

    expect(createContent.mutate).not.toHaveBeenCalled();
  });

  describe('once the content has answers', () => {
    function rangeInputs(answered: boolean): HTMLInputElement[] {
      fixture.componentRef.setInput('answered', answered);
      fixture.detectChanges();
      return ['numeric-minimum-input', 'numeric-maximum-input'].map((id) =>
        fixture.nativeElement.querySelector(`[data-testid="${id}"]`)
      );
    }

    it('keeps the range of an unanswered content editable', async () => {
      setUp(formatData());
      fixture.componentRef.setInput('contentId', 'content-1');
      const inputs = rangeInputs(false);
      await fixture.whenStable();

      expect(inputs.every((i) => !i.disabled)).toBeTrue();
    });

    it('keeps the range of a new content editable', async () => {
      setUp(null);
      const inputs = rangeInputs(false);
      await fixture.whenStable();

      expect(inputs.every((i) => !i.disabled)).toBeTrue();
    });

    it('locks the range', async () => {
      setUp(formatData());
      fixture.componentRef.setInput('contentId', 'content-1');
      const inputs = rangeInputs(true);
      await fixture.whenStable();

      expect(inputs.every((i) => i.disabled)).toBeTrue();
    });
  });

  it('updates the content when a content id is set', () => {
    setUp(formatData({ minNumber: 0, maxNumber: 10 }));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'How many?');

    expect(createContent.mutate).not.toHaveBeenCalled();
    const input = (
      updateContent.mutate.calls.mostRecent().args[0]?.variables as {
        input: Record<string, unknown>;
      }
    ).input;
    expect(input).toEqual({
      id: 'content-1',
      body: 'How many?',
      minNumber: 0,
      maxNumber: 10,
      correctNumber: null,
      tolerance: null,
      duration: null,
      weight: undefined,
      abstentionsAllowed: true,
    });
  });
});
