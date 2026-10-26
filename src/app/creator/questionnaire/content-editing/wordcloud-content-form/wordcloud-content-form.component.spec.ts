import { failedOperation } from '@testing/graphql-fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  CreateQuestionnaireWordcloudContentGql,
  UpdateQuestionnaireWordcloudContentGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { WordcloudContentFormComponent } from './wordcloud-content-form.component';

describe('WordcloudContentFormComponent', () => {
  let fixture: ComponentFixture<WordcloudContentFormComponent>;
  let component: WordcloudContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireWordcloudContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireWordcloudContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let pageService: jasmine.SpyObj<QuestionnairePageService>;

  function setUp(contentId?: string, maxAnswers?: number) {
    createContent = jasmine.createSpyObj(
      'CreateQuestionnaireWordcloudContentGql',
      ['mutate']
    );
    createContent.mutate.and.returnValue(
      of({
        data: { createQuestionnaireWordcloudContent: { id: 'c-1' } },
      }) as never
    );
    updateContent = jasmine.createSpyObj(
      'UpdateQuestionnaireWordcloudContentGql',
      ['mutate']
    );
    updateContent.mutate.and.returnValue(
      of({
        data: { updateQuestionnaireWordcloudContent: { id: 'c-1' } },
      }) as never
    );
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    pageService = jasmine.createSpyObj('QuestionnairePageService', [
      'updateEditedContent',
    ]);

    configureTestModule(
      [getTranslocoModule(), WordcloudContentFormComponent],
      [
        {
          provide: CreateQuestionnaireWordcloudContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnaireWordcloudContentGql,
          useValue: updateContent,
        },
        { provide: NotificationService, useValue: notificationService },
        { provide: QuestionnairePageService, useValue: pageService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(WordcloudContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'formatData',
      maxAnswers === undefined ? null : { maxAnswers }
    );
    if (contentId) {
      fixture.componentRef.setInput('contentId', contentId);
    }
    fixture.componentRef.setInput('duration', 60);
    fixture.detectChanges();
  }

  it('suggests three keywords for a new content', () => {
    setUp();

    expect(component.maxAnswers()).toBe(3);
  });

  it('takes over the keyword count of an existing content', () => {
    setUp('c-1', 5);

    expect(component.maxAnswers()).toBe(5);
  });

  it('accepts between one and ten keywords', () => {
    setUp();

    for (const count of [1, 10]) {
      component.maxAnswers.set(count);
      expect(component.formatDataValid()).toBeTrue();
    }
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('warns about a keyword count out of range and submits nothing', () => {
    setUp();
    component.maxAnswers.set(11);

    component.submit('q-1', 'Body');

    expect(notificationService.showAdvanced).toHaveBeenCalled();
    expect(createContent.mutate).not.toHaveBeenCalled();
  });

  it('creates a new content and reports it as submitted', () => {
    setUp();
    const submitted = jasmine.createSpy('submitted');
    component.submitted.subscribe(submitted);
    component.maxAnswers.set(4);

    component.submit('q-1', 'Body');

    expect(createContent.mutate.calls.mostRecent().args[0].variables).toEqual({
      input: {
        questionnaireId: 'q-1',
        body: 'Body',
        maxAnswers: 4,
        duration: 60,
        abstentionsAllowed: true,
      },
    });
    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(submitted).toHaveBeenCalled();
  });

  it('updates an existing content and hands it to the page', () => {
    setUp('c-1', 5);

    component.submit('q-1', 'Body');

    expect(updateContent.mutate.calls.mostRecent().args[0].variables).toEqual({
      input: {
        id: 'c-1',
        body: 'Body',
        duration: 60,
        abstentionsAllowed: true,
        maxAnswers: 5,
      },
    });
    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(pageService.updateEditedContent).toHaveBeenCalledWith({
      id: 'c-1',
    } as never);
  });

  it('reports a failed creation and reports nothing as submitted', () => {
    setUp();
    createContent.mutate.and.returnValue(failedOperation() as never);
    const submitted = jasmine.createSpy('submitted');
    component.submitted.subscribe(submitted);

    component.submit('q-1', 'Body');

    expect(submitted).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('reports a failed update and hands nothing to the page', () => {
    setUp('c-1', 5);
    updateContent.mutate.and.returnValue(failedOperation() as never);

    component.submit('q-1', 'Body');

    expect(pageService.updateEditedContent).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });
});
