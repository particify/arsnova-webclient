import { signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ContentPresentationService } from '@app/presentation/content-presentation.service';
import { QuestionnaireByIdGql, UserUiSettings } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER } from 'rxjs';
import { ContentsPageComponent } from './contents-page.component';

describe('ContentsPageComponent', () => {
  let fixture: ComponentFixture<ContentsPageComponent>;
  let storage: Map<symbol, unknown>;

  function spyProvider(token: Type<unknown>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  beforeEach(() => {
    // The stepper and the rest of the template are irrelevant here.
    TestBed.overrideComponent(ContentsPageComponent, {
      set: { template: '', imports: [] },
    });
    storage = new Map();
    const globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    globalStorageService.getItem.and.callFake((key: symbol) =>
      storage.get(key)
    );
    globalStorageService.setItem.and.callFake((key: symbol, value: unknown) =>
      storage.set(key, value)
    );
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({ valueChanges: NEVER });
    const contentPresentationService = jasmine.createSpyObj(
      'ContentPresentationService',
      ['setQuestionnaireId', 'setCurrentContentIndex'],
      {
        contents: signal([]),
        loadingContents: signal(false),
        currentContentIndex: signal(0),
        currentContent: signal(undefined),
      }
    );

    configureTestModule(
      [getTranslocoModule(), ContentsPageComponent],
      [
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: GlobalStorageService, useValue: globalStorageService },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        {
          provide: ContentPresentationService,
          useValue: contentPresentationService,
        },
        {
          provide: PresentationService,
          useValue: { scale: signal(undefined) },
        },
        spyProvider(DialogService, ['openPublishGroupDialog']),
        spyProvider(FocusModeService, ['updateContentState']),
        spyProvider(NotificationService, ['showAdvanced']),
        spyProvider(Router, ['navigate']),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentsPageComponent);
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
  });

  function present(questionnaireId: string) {
    fixture.componentRef.setInput('questionnaireId', questionnaireId);
    fixture.detectChanges();
  }

  it('remembers the presented questionnaire', () => {
    present('q-1');

    expect(storage.get(STORAGE_KEYS.LAST_GROUP)).toBe('q-1');
  });

  it('remembers the questionnaire presented next over the previous one', () => {
    present('q-1');

    present('q-2');

    expect(storage.get(STORAGE_KEYS.LAST_GROUP)).toBe('q-2');
  });

  it('prefers the questionnaire of the route over a remembered one', () => {
    storage.set(STORAGE_KEYS.LAST_GROUP, 'q-1');

    present('q-2');

    expect(storage.get(STORAGE_KEYS.LAST_GROUP)).toBe('q-2');
  });
});
