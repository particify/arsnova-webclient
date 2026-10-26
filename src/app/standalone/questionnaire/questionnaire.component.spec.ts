import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  QuestionnaireSummaryFragment,
  QuestionnaireType,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { failedOperation } from '@testing/graphql-fixtures';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { QuestionnaireComponent } from './questionnaire.component';

describe('QuestionnaireComponent', () => {
  let fixture: ComponentFixture<QuestionnaireComponent>;
  let togglePublished: jasmine.SpyObj<ToggleQuestionnairePublishedGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  let globalStorageService: jasmine.SpyObj<GlobalStorageService>;
  const route = {};

  function questionnaire(published: boolean): QuestionnaireSummaryFragment {
    return {
      id: 'q-1',
      name: 'My quiz',
      type: QuestionnaireType.Quiz,
      published,
      contentCount: 3,
    } as QuestionnaireSummaryFragment;
  }

  function setUp(published: boolean, isParticipant = false) {
    togglePublished = jasmine.createSpyObj('ToggleQuestionnairePublishedGql', [
      'mutate',
    ]);
    togglePublished.mutate.and.returnValue(of({ data: {} }) as never);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
      'showOnRequestClientError',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
      'setItem',
    ]);
    configureTestModule(
      [getTranslocoModule(), QuestionnaireComponent],
      [
        { provide: ToggleQuestionnairePublishedGql, useValue: togglePublished },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: GlobalStorageService, useValue: globalStorageService },
        {
          provide: ContentGroupService,
          useValue: { getQuestionnaireTypeIcons: () => new Map() },
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(QuestionnaireComponent);
    fixture.componentRef.setInput('questionnaire', questionnaire(published));
    fixture.componentRef.setInput('isParticipant', isParticipant);
    fixture.detectChanges();
  }

  function publishingButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.publishing-btn');
  }

  it('opens the questionnaire and remembers it', () => {
    setUp(true);

    fixture.debugElement.query(By.css('mat-card')).nativeElement.click();

    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['.', 'questionnaire', 'q-1'],
      { relativeTo: route as ActivatedRoute }
    );
    expect(globalStorageService.setItem).toHaveBeenCalledOnceWith(
      STORAGE_KEYS.LAST_GROUP,
      'q-1'
    );
  });

  it('publishes an unpublished questionnaire without opening it', () => {
    setUp(false);

    publishingButton()!.click();

    expect(togglePublished.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 'q-1', published: true },
    });
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'creator.content.group-published',
      AdvancedSnackBarTypes.SUCCESS
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('locks a published questionnaire', () => {
    setUp(true);

    publishingButton()!.click();

    expect(togglePublished.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 'q-1', published: false },
    });
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'creator.content.group-locked',
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('reports a failed toggle instead of confirming it', () => {
    setUp(false);
    togglePublished.mutate.and.returnValue(failedOperation() as never);

    publishingButton()!.click();

    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('offers participants no publishing', () => {
    setUp(true, true);

    expect(publishingButton()).toBeNull();
  });
});
