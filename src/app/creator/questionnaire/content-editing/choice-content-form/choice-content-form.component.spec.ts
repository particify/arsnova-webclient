import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DisplayAnswer } from '@app/creator/questionnaire/content-editing/_models/display-answer';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  CreateQuestionnaireChoiceContentGql,
  UpdateQuestionnaireChoiceContentGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { ChoiceContentFormComponent } from './choice-content-form.component';

describe('ChoiceContentFormComponent', () => {
  let fixture: ComponentFixture<ChoiceContentFormComponent>;
  let component: ChoiceContentFormComponent;
  let updateChoiceContent: jasmine.SpyObj<UpdateQuestionnaireChoiceContentGql>;

  function setUp(hasCorrectAnswer: boolean, correctOptionIndexes: number[]) {
    TestBed.overrideComponent(ChoiceContentFormComponent, {
      set: { template: '' },
    });
    const contentService = jasmine.createSpyObj('ContentService', [
      'getAnswerOptions',
    ]);
    contentService.getAnswerOptions.and.callFake(
      ContentService.prototype.getAnswerOptions
    );
    updateChoiceContent = jasmine.createSpyObj(
      'UpdateQuestionnaireChoiceContentGql',
      ['mutate']
    );
    updateChoiceContent.mutate.and.returnValue(of({ data: undefined }));

    configureTestModule(
      [getTranslocoModule(), ChoiceContentFormComponent],
      [
        { provide: ContentService, useValue: contentService },
        {
          provide: UpdateQuestionnaireChoiceContentGql,
          useValue: updateChoiceContent,
        },
        {
          provide: CreateQuestionnaireChoiceContentGql,
          useValue: jasmine.createSpyObj(
            'CreateQuestionnaireChoiceContentGql',
            ['mutate']
          ),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
        {
          provide: QuestionnairePageService,
          useValue: jasmine.createSpyObj('QuestionnairePageService', [
            'updateEditedContent',
          ]),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ChoiceContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('hasCorrectAnswer', hasCorrectAnswer);
    fixture.componentRef.setInput('formatData', {
      options: [{ label: 'A' }, { label: 'B' }],
      correctOptionIndexes,
    });
    fixture.detectChanges();
    spyOn(component, 'formatDataValid').and.returnValue(true);
  }

  function submittedCorrectOptionIndexes() {
    return updateChoiceContent.mutate.calls.mostRecent().args[0]?.variables
      ?.input.correctOptionIndexes;
  }

  it('clears the correct options when the correct answer is switched off', () => {
    setUp(true, [1]);
    fixture.componentRef.setInput('hasCorrectAnswer', false);

    component.submit('questionnaire-1', 'body');

    expect(submittedCorrectOptionIndexes()).toBeNull();
  });

  it('sends the correct options when the correct answer is switched on', () => {
    setUp(false, []);
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    component.onAnswersChange([
      new DisplayAnswer('A', false),
      new DisplayAnswer('B', true),
    ]);

    component.submit('questionnaire-1', 'body');

    expect(submittedCorrectOptionIndexes()).toEqual([1]);
  });
});
