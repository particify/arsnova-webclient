import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatInputHarness } from '@angular/material/input/testing';
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

  describe('once the content has answers', () => {
    async function render(answered: boolean, contentId?: string) {
      const contentService = jasmine.createSpyObj('ContentService', [
        'getAnswerOptions',
      ]);
      contentService.getAnswerOptions.and.callFake(
        ContentService.prototype.getAnswerOptions
      );
      configureTestModule(
        [getTranslocoModule(), ChoiceContentFormComponent],
        [
          { provide: ContentService, useValue: contentService },
          {
            provide: UpdateQuestionnaireChoiceContentGql,
            useValue: jasmine.createSpyObj(
              'UpdateQuestionnaireChoiceContentGql',
              ['mutate']
            ),
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
          QuestionnairePageService,
        ]
      ).compileComponents();
      fixture = TestBed.createComponent(ChoiceContentFormComponent);
      if (contentId) {
        fixture.componentRef.setInput('contentId', contentId);
      }
      fixture.componentRef.setInput('hasCorrectAnswer', true);
      fixture.componentRef.setInput('answered', answered);
      fixture.componentRef.setInput('formatData', {
        options: [{ label: 'A' }, { label: 'B' }],
        correctOptionIndexes: [1],
      });
      fixture.detectChanges();
      return TestbedHarnessEnvironment.loader(fixture);
    }

    it('keeps the correct options of an unanswered content editable', async () => {
      const loader = await render(false, 'content-1');

      for (const checkbox of await loader.getAllHarnesses(MatCheckboxHarness)) {
        expect(await checkbox.isDisabled()).toBeFalse();
      }
    });

    it('locks the correct options but not the labels', async () => {
      const loader = await render(true, 'content-1');

      const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);
      expect(checkboxes.length).toBe(2);
      for (const checkbox of checkboxes) {
        expect(await checkbox.isDisabled()).toBeTrue();
      }
      for (const label of await loader.getAllHarnesses(MatInputHarness)) {
        expect(await label.isDisabled()).toBeFalse();
      }
    });

    it('leaves a new content unlocked whatever it is told about answers', async () => {
      const loader = await render(true);

      for (const checkbox of await loader.getAllHarnesses(MatCheckboxHarness)) {
        expect(await checkbox.isDisabled()).toBeFalse();
      }
    });
  });
});
