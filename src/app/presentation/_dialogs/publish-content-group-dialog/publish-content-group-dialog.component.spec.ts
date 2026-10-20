import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  QuestionnairePublishingMode,
  UpdateQuestionnaireGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { PublishContentGroupDialogComponent } from './publish-content-group-dialog.component';

describe('PublishContentGroupDialogComponent', () => {
  let updateQuestionnaire: jasmine.SpyObj<UpdateQuestionnaireGql>;
  let dialogRef: jasmine.SpyObj<
    MatDialogRef<PublishContentGroupDialogComponent>
  >;

  function setUp(publishingMode: QuestionnairePublishingMode) {
    updateQuestionnaire = jasmine.createSpyObj('UpdateQuestionnaireGql', [
      'mutate',
    ]);
    updateQuestionnaire.mutate.and.returnValue(of({ data: {} }) as never);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.overrideComponent(PublishContentGroupDialogComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), PublishContentGroupDialogComponent],
      [
        { provide: UpdateQuestionnaireGql, useValue: updateQuestionnaire },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { questionnaireId: 'q-1', publishingMode },
        },
      ]
    ).compileComponents();
    const fixture = TestBed.createComponent(PublishContentGroupDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function sentVariables() {
    return updateQuestionnaire.mutate.calls.mostRecent().args[0]?.variables;
  }

  it('publishes with all contents by default', () => {
    setUp(QuestionnairePublishingMode.All).updatePublishingMode();
    expect(sentVariables()).toEqual({
      id: 'q-1',
      published: true,
      publishingMode: QuestionnairePublishingMode.All,
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(
      QuestionnairePublishingMode.All
    );
  });

  it('publishes with the chosen range mode', () => {
    const component = setUp(QuestionnairePublishingMode.All);
    component.selectedMode.set(
      component.publishingModes.find(
        (mode) => mode.type === QuestionnairePublishingMode.UpTo
      )!
    );
    component.updatePublishingMode();
    expect(sentVariables()?.publishingMode).toBe(
      QuestionnairePublishingMode.UpTo
    );
    expect(dialogRef.close).toHaveBeenCalledOnceWith(
      QuestionnairePublishingMode.UpTo
    );
  });

  it('keeps a live questionnaire live', () => {
    setUp(QuestionnairePublishingMode.Live).updatePublishingMode();
    expect(sentVariables()?.publishingMode).toBe(
      QuestionnairePublishingMode.Live
    );
  });
});
