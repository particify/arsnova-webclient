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
import { ContentSortAnswerComponent } from '@app/standalone/content-answers/content-sort-answer/content-sort-answer.component';
import {
  ContentType,
  CreateQuestionnaireSortContentGql,
  SortContentFormatData,
  UpdateQuestionnaireSortContentGql,
} from '@gql/generated/graphql';
import { SortContentFormComponent } from './sort-content-form.component';

function formatData(labels: string[]): SortContentFormatData {
  return {
    __typename: 'SortContentFormatData',
    format: ContentType.Sort,
    options: labels.map((label) => ({
      __typename: 'AnswerOption' as const,
      label,
      labelRendered: null,
    })),
  };
}

describe('SortContentFormComponent', () => {
  let fixture: ComponentFixture<SortContentFormComponent>;
  let component: SortContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireSortContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireSortContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(initialFormatData: SortContentFormatData | null) {
    createContent = jasmine.createSpyObj('CreateQuestionnaireSortContentGql', [
      'mutate',
    ]);
    createContent.mutate.and.returnValue(of({ data: undefined }));
    updateContent = jasmine.createSpyObj('UpdateQuestionnaireSortContentGql', [
      'mutate',
    ]);
    updateContent.mutate.and.returnValue(of({ data: undefined }));
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    configureTestModule(
      [getTranslocoModule(), SortContentFormComponent],
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
          provide: CreateQuestionnaireSortContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnaireSortContentGql,
          useValue: updateContent,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(SortContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  function answerList(): AnswerOptionListComponent | undefined {
    return fixture.debugElement.query(By.directive(AnswerOptionListComponent))
      ?.componentInstance;
  }

  function preview(): ContentSortAnswerComponent | undefined {
    return fixture.debugElement.query(By.directive(ContentSortAnswerComponent))
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

  it('lets the list reorder and delete but never mark a correct item', () => {
    setUp(formatData(['A', 'B', 'C']));
    expect(answerList()?.sortable).toBe(true);
    expect(answerList()?.correctAnswers).toBe(false);
    expect(answerList()?.minimumAnswerCount).toBe(2);
  });

  it('seeds the items from an existing content, keeping their order', () => {
    setUp(formatData(['A', 'B', 'C']));
    expect(component.displayAnswers().map((a) => a.option)).toEqual([
      'A',
      'B',
      'C',
    ]);
  });

  it('restores the creator order from the shuffled stored options', () => {
    setUp({ ...formatData(['C', 'A', 'B']), correctOrder: [1, 2, 0] });
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

  it('re-seeds the items when the persisted order itself changes', () => {
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

  it('rejects duplicate items, which no order could tell apart', () => {
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

  it('shows the items in their correct order in the preview', () => {
    setUp(formatData(['A', 'B', 'C']));
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    expect(answerList()).toBeUndefined();
    expect(preview()).toBeDefined();
    expect(component.previewItems().map((item) => item.label)).toEqual([
      'A',
      'B',
      'C',
    ]);
    // Not answerable in the preview, so the items carry no grab cursor.
    expect(fixture.debugElement.query(By.css('.no-grab'))).not.toBeNull();
    expect(component.formatDataValid()).toBe(true);
  });

  it('does not submit an invalid item list', () => {
    setUp(null);
    component.submit('questionnaire-1', 'Order these');
    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(updateContent.mutate).not.toHaveBeenCalled();
  });

  it('creates a content with the items in order and the shared inputs', () => {
    setUp(null);
    fixture.componentRef.setInput('duration', 30);
    fixture.componentRef.setInput('weight', 2);
    fixture.componentRef.setInput('abstentionsAllowed', false);
    setItems(['A', 'B']);

    component.submit('questionnaire-1', 'Order these');

    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(input()).toEqual({
      questionnaireId: 'questionnaire-1',
      body: 'Order these',
      options: ['A', 'B'],
      duration: 30,
      weight: 2,
      abstentionsAllowed: false,
    });
  });

  it('updates the content when a content id is set', () => {
    setUp(formatData(['A', 'B', 'C']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'Order these');

    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(input()).toEqual({
      id: 'content-1',
      body: 'Order these',
      options: ['A', 'B', 'C'],
      duration: null,
      weight: undefined,
      abstentionsAllowed: true,
    });
  });

  it('submits the order the creator dragged the items into', () => {
    setUp(formatData(['A', 'B', 'C']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.detectChanges();

    answerList()?.drop(2, 0);
    fixture.detectChanges();
    component.submit('questionnaire-1', 'Order these');

    expect(input().options).toEqual(['C', 'A', 'B']);
  });

  it('goes on reordering the current items after one was deleted', () => {
    setUp(formatData(['A', 'B', 'C']));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.detectChanges();

    answerList()?.deleteAnswer(1);
    fixture.detectChanges();
    answerList()?.drop(1, 0);
    fixture.detectChanges();
    component.submit('questionnaire-1', 'Order these');

    expect(input().options).toEqual(['C', 'A']);
  });
});
