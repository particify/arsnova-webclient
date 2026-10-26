import { failedOperation } from '@testing/graphql-fixtures';
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
  CreateQuestionnaireTextContentGql,
  TextContentFormatData,
  UpdateQuestionnaireTextContentGql,
} from '@gql/generated/graphql';
import { TextContentFormComponent } from './text-content-form.component';

function formatData(): TextContentFormatData {
  return {
    __typename: 'TextContentFormatData',
    format: ContentType.Text,
    answersPublished: false,
  };
}

describe('TextContentFormComponent', () => {
  let fixture: ComponentFixture<TextContentFormComponent>;
  let component: TextContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireTextContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireTextContentGql>;

  function setUp(initialFormatData: TextContentFormatData | null) {
    createContent = jasmine.createSpyObj('CreateQuestionnaireTextContentGql', [
      'mutate',
    ]);
    createContent.mutate.and.returnValue(of({ data: undefined }));
    updateContent = jasmine.createSpyObj('UpdateQuestionnaireTextContentGql', [
      'mutate',
    ]);
    updateContent.mutate.and.returnValue(of({ data: undefined }));

    configureTestModule(
      [getTranslocoModule(), TextContentFormComponent],
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
        { provide: CreateQuestionnaireTextContentGql, useValue: createContent },
        { provide: UpdateQuestionnaireTextContentGql, useValue: updateContent },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(TextContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  it('is always valid because there is no format-specific field', () => {
    setUp(null);
    expect(component.formatDataValid()).toBe(true);
  });

  it('creates a text content with the shared inputs when there is no content id', () => {
    setUp(null);
    fixture.componentRef.setInput('duration', 30);
    fixture.componentRef.setInput('abstentionsAllowed', false);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'The question');

    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(createContent.mutate).toHaveBeenCalled();
    const variables = createContent.mutate.calls.mostRecent().args[0]
      ?.variables as { input: Record<string, unknown> };
    expect(variables.input).toEqual({
      questionnaireId: 'questionnaire-1',
      body: 'The question',
      duration: 30,
      abstentionsAllowed: false,
    });
  });

  it('reports a failed creation and reports nothing as submitted', () => {
    setUp(null);
    createContent.mutate.and.returnValue(failedOperation() as never);
    const submitted = jasmine.createSpy('submitted');
    component.submitted.subscribe(submitted);

    component.submit('questionnaire-1', 'The question');

    expect(submitted).not.toHaveBeenCalled();
    expect(
      TestBed.inject(NotificationService).showAdvanced
    ).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('updates the text content when a content id is set', () => {
    setUp(formatData());
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'The question');

    expect(createContent.mutate).not.toHaveBeenCalled();
    const variables = updateContent.mutate.calls.mostRecent().args[0]
      ?.variables as { input: Record<string, unknown> };
    expect(variables.input).toEqual({
      id: 'content-1',
      body: 'The question',
      duration: null,
      abstentionsAllowed: true,
    });
  });

  it('reports a failed update', () => {
    setUp(formatData());
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();
    updateContent.mutate.and.returnValue(failedOperation() as never);

    component.submit('questionnaire-1', 'The question');

    expect(
      TestBed.inject(NotificationService).showAdvanced
    ).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });
});
