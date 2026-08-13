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
import { AnswerOptionListComponent } from '@app/creator/questionnaire/content-editing/answer-option-list/answer-option-list.component';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import { ContentPrioritizationAnswerComponent } from '@app/standalone/content-answers/content-prioritization-answer/content-prioritization-answer.component';
import {
  ContentType,
  CreateQuestionnairePrioritizationContentGql,
  PrioritizationContentFormatData,
  UpdateQuestionnairePrioritizationContentGql,
} from '@gql/generated/graphql';
import { PrioritizationContentFormComponent } from './prioritization-content-form.component';

const ASSIGNABLE_POINTS = 60;

function formatData(labels: string[]): PrioritizationContentFormatData {
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

describe('PrioritizationContentFormComponent', () => {
  let fixture: ComponentFixture<PrioritizationContentFormComponent>;
  let component: PrioritizationContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnairePrioritizationContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnairePrioritizationContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(initialFormatData: PrioritizationContentFormatData | null) {
    createContent = jasmine.createSpyObj(
      'CreateQuestionnairePrioritizationContentGql',
      ['mutate']
    );
    createContent.mutate.and.returnValue(of({ data: undefined }));
    updateContent = jasmine.createSpyObj(
      'UpdateQuestionnairePrioritizationContentGql',
      ['mutate']
    );
    updateContent.mutate.and.returnValue(of({ data: undefined }));
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    configureTestModule(
      [getTranslocoModule(), PrioritizationContentFormComponent],
      [
        { provide: NotificationService, useValue: notificationService },
        // The preview renders the items, which the shared text component
        // formats through this service.
        {
          provide: FormattingService,
          useValue: { postString: () => of({ html: '' }) },
        },
        {
          provide: QuestionnairePageService,
          useValue: new QuestionnairePageService(),
        },
        {
          provide: CreateQuestionnairePrioritizationContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnairePrioritizationContentGql,
          useValue: updateContent,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(PrioritizationContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  function answerList(): AnswerOptionListComponent | undefined {
    return fixture.debugElement.query(By.directive(AnswerOptionListComponent))
      ?.componentInstance;
  }

  function preview(): ContentPrioritizationAnswerComponent | undefined {
    return fixture.debugElement.query(
      By.directive(ContentPrioritizationAnswerComponent)
    )?.componentInstance;
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

  function setItems(labels: string[]) {
    component.displayAnswers.update((answers) =>
      answers.map((answer, i) => ({ ...answer, option: labels[i] ?? '' }))
    );
    fixture.detectChanges();
  }

  it('offers two empty items on a new content', () => {
    setUp(null);
    expect(answerList()?.answers().length).toBe(2);
    expect(
      answerList()
        ?.answers()
        .map((a) => a.option)
    ).toEqual(['', '']);
  });

  it('never marks a correct item and never reorders, order carrying no meaning', () => {
    setUp(formatData(['A', 'B', 'C']));
    expect(answerList()?.correctAnswers).toBe(false);
    expect(answerList()?.sortable).toBe(false);
    expect(answerList()?.minimumAnswerCount).toBe(2);
  });

  it('labels the list as items to prioritize rather than answer options', () => {
    setUp(formatData(['A', 'B']));
    expect(answerList()?.optionLabel).toBe('item');
    expect(answerList()?.optionLabels).toBe('items');
    expect(
      fixture.debugElement.query(By.css('.section-label')).nativeElement
        .textContent
    ).toContain('creator.content.items-for-prioritization');
  });

  it('seeds the items from an existing content', () => {
    setUp(formatData(['A', 'B', 'C']));
    expect(component.displayAnswers().map((a) => a.option)).toEqual([
      'A',
      'B',
      'C',
    ]);
  });

  it('keeps just-edited items when the content re-emits unchanged', () => {
    setUp(formatData(['A', 'B']));
    fixture.componentRef.setInput('contentId', 'content-1');
    setItems(['C', 'B']);

    // Apollo hands out a fresh object on every cache update, e.g. when an
    // answer count arrives, so the items are compared by value.
    fixture.componentRef.setInput('formatData', formatData(['A', 'B']));
    fixture.detectChanges();

    expect(component.displayAnswers().map((a) => a.option)).toEqual(['C', 'B']);
  });

  it('re-seeds the items when the persisted ones themselves change', () => {
    setUp(formatData(['A', 'B']));
    fixture.componentRef.setInput('contentId', 'content-1');
    setItems(['C', 'B']);

    fixture.componentRef.setInput('formatData', formatData(['B', 'A']));
    fixture.detectChanges();

    expect(component.displayAnswers().map((a) => a.option)).toEqual(['B', 'A']);
  });

  it('keeps the items editable while nothing has been answered', () => {
    setUp(formatData(['A', 'B']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.detectChanges();
    expect(component.locked()).toBe(false);
    expect(answerList()?.allowDeletion).toBe(true);
    expect(answerList()?.disabled).toBe(false);
  });

  it('locks the items once the content has been answered', () => {
    setUp(formatData(['A', 'B']));
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

  it('rejects an empty item', () => {
    setUp(null);
    expect(component.formatDataValid()).toBe(false);
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('rejects duplicate items, which no ranking could tell apart', () => {
    setUp(formatData(['A', 'A']));
    expect(component.formatDataValid()).toBe(false);
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('accepts two distinct items', () => {
    setUp(formatData(['A', 'B']));
    expect(component.formatDataValid()).toBe(true);
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('shows the items with the persisted budget in the preview', () => {
    setUp(formatData(['A', 'B', 'C']));
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    expect(answerList()).toBeUndefined();
    expect(
      preview()
        ?.answerOptions()
        .map((item) => item.label)
    ).toEqual(['A', 'B', 'C']);
    expect(preview()?.assignablePoints()).toBe(ASSIGNABLE_POINTS);
    expect(preview()?.disabled()).toBe(true);
    expect(component.formatDataValid()).toBe(true);
  });

  it('previews a content still being created without a budget', () => {
    setUp(null);
    setItems(['A', 'B']);
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    expect(preview()?.assignablePoints()).toBe(0);
  });

  it('does not submit an invalid item list', () => {
    setUp(null);
    component.submit('questionnaire-1', 'Weigh these');
    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(updateContent.mutate).not.toHaveBeenCalled();
  });

  it('creates a content with the items and the shared inputs, but no weight', () => {
    setUp(null);
    fixture.componentRef.setInput('duration', 30);
    fixture.componentRef.setInput('abstentionsAllowed', false);
    setItems(['A', 'B']);

    component.submit('questionnaire-1', 'Weigh these');

    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(input()).toEqual({
      questionnaireId: 'questionnaire-1',
      body: 'Weigh these',
      options: ['A', 'B'],
      duration: 30,
      abstentionsAllowed: false,
    });
  });

  it('updates the content when a content id is set', () => {
    setUp(formatData(['A', 'B', 'C']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'Weigh these');

    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(input()).toEqual({
      id: 'content-1',
      body: 'Weigh these',
      options: ['A', 'B', 'C'],
      duration: null,
      abstentionsAllowed: true,
    });
  });

  it('submits the items the creator added and kept', () => {
    setUp(formatData(['A', 'B', 'C']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.detectChanges();

    answerList()?.deleteAnswer(1);
    fixture.detectChanges();
    component.submit('questionnaire-1', 'Weigh these');

    expect(input().options).toEqual(['A', 'C']);
  });
});
