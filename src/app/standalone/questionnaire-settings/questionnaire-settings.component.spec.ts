import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  Questionnaire,
  QuestionnairePublishingMode,
  QuestionnaireType,
  UpdateQuestionnaireGql,
} from '@gql/generated/graphql';
import { CombinedGraphQLErrors } from '@apollo/client';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of, throwError } from 'rxjs';
import { QuestionnaireSettingsComponent } from './questionnaire-settings.component';

describe('QuestionnaireSettingsComponent', () => {
  let fixture: ComponentFixture<QuestionnaireSettingsComponent>;
  let component: QuestionnaireSettingsComponent;
  let updateQuestionnaire: jasmine.SpyObj<UpdateQuestionnaireGql>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<QuestionnaireSettingsComponent>>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function questionnaire(overrides: Partial<Questionnaire> = {}) {
    return {
      id: 'q-1',
      name: 'Quiz',
      type: QuestionnaireType.Quiz,
      published: true,
      publishingMode: QuestionnairePublishingMode.UpTo,
      statisticsPublished: true,
      correctOptionsPublished: false,
      leaderboardEnabled: true,
      ...overrides,
    } as Questionnaire;
  }

  function setUp(q = questionnaire()) {
    // The form logic is tested here; the toggles have their own specs.
    TestBed.overrideComponent(QuestionnaireSettingsComponent, {
      set: { template: '', imports: [] },
    });
    updateQuestionnaire = jasmine.createSpyObj('UpdateQuestionnaireGql', [
      'mutate',
    ]);
    updateQuestionnaire.mutate.and.returnValue(
      of({ data: { updateQuestionnaire: { id: 'q-1' } } }) as never
    );
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showOnRequestClientError',
    ]);

    configureTestModule(
      [getTranslocoModule(), QuestionnaireSettingsComponent],
      [
        { provide: UpdateQuestionnaireGql, useValue: updateQuestionnaire },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { questionnaire: q, alreadyAnswered: false },
        },
        { provide: NotificationService, useValue: notificationService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(QuestionnaireSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function savedVariables() {
    return updateQuestionnaire.mutate.calls.mostRecent().args[0]?.variables;
  }

  it('starts with the name of the questionnaire', () => {
    setUp();

    expect(component.nameFormControl.value).toBe('Quiz');
  });

  it('saves the name together with the unchanged settings', () => {
    setUp();
    component.nameFormControl.setValue('Final quiz');

    component.saveGroup();

    expect(savedVariables()).toEqual({
      id: 'q-1',
      name: 'Final quiz',
      published: true,
      publishingMode: QuestionnairePublishingMode.UpTo,
      statisticsPublished: true,
      correctOptionsPublished: false,
      leaderboardEnabled: true,
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'q-1' } as never);
  });

  it('saves nothing without a valid name', () => {
    setUp();

    for (const name of ['', 'x'.repeat(51)]) {
      component.nameFormControl.setValue(name);
      component.saveGroup();
    }

    expect(updateQuestionnaire.mutate).not.toHaveBeenCalled();
  });

  it('switches to live mode and back to the previous mode', () => {
    setUp();

    component.setLiveMode(true);
    expect(component.isLive()).toBeTrue();

    component.setLiveMode(false);
    expect(component.questionnaire.publishingMode).toBe(
      QuestionnairePublishingMode.UpTo
    );
  });

  it('marks a name already taken in the room', () => {
    setUp();
    updateQuestionnaire.mutate.and.returnValue(
      throwError(
        () =>
          new CombinedGraphQLErrors({
            errors: [
              {
                message: 'Duplicate name',
                extensions: { classification: 'BAD_REQUEST' },
              },
            ],
          })
      ) as never
    );

    component.saveGroup();

    expect(component.nameFormControl.hasError('validateUniqueName')).toBeTrue();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.formDisabled).toBeFalse();
  });

  it('reports any other failure', () => {
    setUp();
    updateQuestionnaire.mutate.and.returnValue(
      throwError(
        () =>
          new CombinedGraphQLErrors({
            errors: [
              {
                message: 'Failure',
                extensions: { classification: 'INTERNAL_ERROR' },
              },
            ],
          })
      ) as never
    );

    component.saveGroup();

    expect(notificationService.showOnRequestClientError).toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
